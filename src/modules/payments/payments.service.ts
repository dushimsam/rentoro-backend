import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RentalRequestsService } from '../rental-requests/rental-requests.service';
import { RentalRequestStatus } from '../rental-requests/entities/rental-request.entity';
import { StripeService } from './services/stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private rentalRequestsService: RentalRequestsService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, userId: string) {
    const { requestId } = createPaymentIntentDto;
    
    // Find the rental request
    const rentalRequest = await this.rentalRequestsService.findOne(requestId, userId);
    
    if (rentalRequest.status !== RentalRequestStatus.PENDING) {
      throw new BadRequestException('Can only pay for pending rental requests');
    }
    
    // Check if payment already exists and is completed
    const existingPayment = await this.paymentsRepository.findOne({
      where: { rentalRequestId: requestId },
    });
    
    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed for this rental request');
    }

    // Create a new payment record with PENDING status
    const payment = this.paymentsRepository.create({
      userId,
      rentalRequestId: requestId,
      amount: rentalRequest.totalCost,
      paymentMethod: PaymentMethod.CREDIT_CARD, // Default to credit card for Stripe
      status: PaymentStatus.PENDING,
    });
    
    const savedPayment = await this.paymentsRepository.save(payment);

    // Create a payment intent with Stripe
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        rentalRequest.totalCost,
        this.configService.get<string>('stripe.currency'),
        {
          payment_id: savedPayment.id,
          rental_request_id: requestId,
          user_id: userId,
        }
      );

      // Update the payment with the Stripe paymentIntentId
      savedPayment.transactionId = paymentIntent.id;
      await this.paymentsRepository.save(savedPayment);

      // Return the client secret which will be used by the frontend to confirm the payment
      return {
        paymentId: savedPayment.id,
        clientSecret: paymentIntent.client_secret,
        amount: rentalRequest.totalCost,
        currency: this.configService.get<string>('stripe.currency'),
      };
    } catch (error) {
      // If Stripe payment intent creation fails, update payment status to FAILED
      savedPayment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(savedPayment);
      
      throw new InternalServerErrorException('Failed to create payment intent with Stripe');
    }
  }

  /**
   * Confirm payment (called after frontend successfully processes payment)
   */
  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string): Promise<Payment> {
    const { paymentIntentId } = confirmPaymentDto;
    
    // Find the payment by the Stripe payment intent ID
    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: paymentIntentId },
      relations: ['rentalRequest'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with transaction ID ${paymentIntentId} not found`);
    }
    
    if (payment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to confirm this payment');
    }
    
    if (payment.status === PaymentStatus.COMPLETED) {
      return payment; // Payment already confirmed
    }
    
    try {
      // Verify payment status with Stripe
      const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update payment status to COMPLETED
        payment.status = PaymentStatus.COMPLETED;
        const savedPayment = await this.paymentsRepository.save(payment);
        
        // Update rental request status
        await this.rentalRequestsService.update(
          payment.rentalRequestId,
          { status: RentalRequestStatus.APPROVED },
          userId
        );
        
        return savedPayment;
      } else {
        throw new BadRequestException(`Payment not successful: ${paymentIntent.status}`);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to confirm payment with Stripe');
    }
  }

  /**
   * Legacy method for creating payments (kept for backward compatibility)
   */
  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const { requestId, paymentMethod } = createPaymentDto;
    
    const rentalRequest = await this.rentalRequestsService.findOne(requestId, userId);
    
    if (rentalRequest.status !== RentalRequestStatus.PENDING) {
      throw new BadRequestException('Can only pay for pending rental requests');
    }
    
    // Check if payment already exists
    const existingPayment = await this.paymentsRepository.findOne({
      where: { rentalRequestId: requestId },
    });
    
    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed for this rental request');
    }
    
    // Mock payment processing - this should be replaced with Stripe integration
    const payment = this.paymentsRepository.create({
      userId,
      rentalRequestId: requestId,
      amount: rentalRequest.totalCost,
      paymentMethod,
      transactionId: `manual_${Date.now()}`,
      status: PaymentStatus.COMPLETED, // Mocking a successful payment
    });
    
    const savedPayment = await this.paymentsRepository.save(payment);
    
    // Update rental request status
    await this.rentalRequestsService.update(
      requestId, 
      { status: RentalRequestStatus.APPROVED },
      userId
    );
    
    return savedPayment;
  }

  async findAll(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      relations: ['rentalRequest', 'rentalRequest.car'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['rentalRequest', 'rentalRequest.car'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    if (payment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment');
    }
    
    return payment;
  }

  async cancelPayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.findOne(id, userId);
    
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }
    
    // Process refund with Stripe if there's a transaction ID
    if (payment.transactionId && payment.transactionId.startsWith('pi_')) {
      try {
        // Create a refund with Stripe
        await this.stripeService.createRefund(payment.transactionId);
        
        // Update payment status to REFUNDED
        payment.status = PaymentStatus.REFUNDED;
        const savedPayment = await this.paymentsRepository.save(payment);
        
        // Update rental request status
        await this.rentalRequestsService.update(
          payment.rentalRequestId,
          { status: RentalRequestStatus.CANCELLED },
          userId
        );
        
        return savedPayment;
      } catch (error) {
        throw new InternalServerErrorException('Failed to process refund with Stripe');
      }
    } else {
      // Legacy refund process for non-Stripe payments
      payment.status = PaymentStatus.REFUNDED;
      const savedPayment = await this.paymentsRepository.save(payment);
      
      await this.rentalRequestsService.update(
        payment.rentalRequestId,
        { status: RentalRequestStatus.CANCELLED },
        userId
      );
      
      return savedPayment;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    try {
      // Verify the webhook signature
      const event = this.stripeService.constructEventFromPayload(payload, signature);
      
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;
          
        // Add more event handlers as needed
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }
  }

  /**
   * Handle payment_intent.succeeded event
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Find the payment by the Stripe payment intent ID
    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: paymentIntent.id },
      relations: ['rentalRequest'],
    });
    
    if (payment && payment.status !== PaymentStatus.COMPLETED) {
      // Update payment status to COMPLETED
      payment.status = PaymentStatus.COMPLETED;
      await this.paymentsRepository.save(payment);
      
      // Update rental request status
      await this.rentalRequestsService.update(
        payment.rentalRequestId,
        { status: RentalRequestStatus.APPROVED },
        payment.userId
      );
    }
  }

  /**
   * Handle payment_intent.payment_failed event
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: paymentIntent.id },
    });
    
    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(payment);
    }
  }

  /**
   * Handle charge.refunded event
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    if (charge.payment_intent) {
      const paymentIntentId = typeof charge.payment_intent === 'string' 
        ? charge.payment_intent 
        : charge.payment_intent.id;
      
      const payment = await this.paymentsRepository.findOne({
        where: { transactionId: paymentIntentId },
        relations: ['rentalRequest'],
      });
      
      if (payment) {
        payment.status = PaymentStatus.REFUNDED;
        await this.paymentsRepository.save(payment);
        
        // Update rental request status
        await this.rentalRequestsService.update(
          payment.rentalRequestId,
          { status: RentalRequestStatus.CANCELLED },
          payment.userId
        );
      }
    }
  }
}
