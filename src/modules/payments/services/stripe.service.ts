import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey'), {
      apiVersion: '2025-02-24.acacia', // Use the required API version
    });
  }

  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(amount: number, currency: string, metadata: any = {}): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe requires amount in cents
      currency: currency.toLowerCase(),
      metadata,
    });
  }

  /**
   * Capture a payment intent that was previously created
   */
  async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }

  /**
   * Retrieve a payment intent by ID
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  /**
   * Create a refund for a payment intent
   */
  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = { payment_intent: paymentIntentId };
    if (amount) {
      params.amount = Math.round(amount * 100); // Stripe requires amount in cents
    }
    return this.stripe.refunds.create(params);
  }

  /**
   * Verify a webhook signature
   */
  constructEventFromPayload(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret');
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
