import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RentalRequestsService } from '../rental-requests/rental-requests.service';
import { RentalRequestStatus } from '../rental-requests/entities/rental-request.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private rentalRequestsService: RentalRequestsService,
  ) {}

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
    
    // In a real implementation, you would integrate with a payment gateway here
    
    // Mock payment processing
    const transactionId = `trx_${uuidv4().replace(/-/g, '')}`;
    
    const payment = this.paymentsRepository.create({
      userId,
      rentalRequestId: requestId,
      amount: rentalRequest.totalCost,
      paymentMethod,
      transactionId,
      status: PaymentStatus.COMPLETED, // Mocking a successful payment
    });
    
    const savedPayment = await this.paymentsRepository.save(payment);
    
    // Update rental request status
    await this.rentalRequestsService.update(
      requestId, 
      { ...rentalRequest, status: RentalRequestStatus.APPROVED },
      userId
    );
    
    return savedPayment;
  }

  async findAll(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      relations: ['rentalRequest', 'rentalRequest.car'],
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
    
    // In a real implementation, you would call the payment gateway to process the refund
    
    payment.status = PaymentStatus.REFUNDED;
    
    const savedPayment = await this.paymentsRepository.save(payment);
    
    // Update rental request status
    await this.rentalRequestsService.update(
      payment.rentalRequestId,
      { status: RentalRequestStatus.CANCELLED },
      userId
    );
    
    return savedPayment;
  }

  async handleWebhook(payload: any): Promise<void> {
    // In a real implementation, this would handle callbacks from the payment gateway
    console.log('Received payment webhook:', payload);
    
    // Validate the webhook signature
    
    // Process the webhook event
    // e.g., update payment status based on webhook event
    
    // For example:
    // if (payload.type === 'payment_intent.succeeded') {
    //   const payment = await this.paymentsRepository.findOne({
    //     where: { transactionId: payload.data.object.id },
    //   });
    //   
    //   if (payment) {
    //     payment.status = PaymentStatus.COMPLETED;
    //     await this.paymentsRepository.save(payment);
    //   }
    // }
  }
}
