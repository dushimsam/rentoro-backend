import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  Headers, 
  RawBodyRequest,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiHeader,
  ApiBody
} from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a Stripe payment intent' })
  @ApiResponse({ 
    status: 201, 
    description: 'The payment intent has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', format: 'uuid', example: '9012' },
        clientSecret: { type: 'string', example: 'pi_1234_secret_5678' },
        amount: { type: 'number', example: 229.95 },
        currency: { type: 'string', example: 'usd' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid rental request or already paid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto, 
    @Req() req
  ) {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto, req.user.id);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Confirm a payment after successful frontend payment processing' })
  @ApiResponse({ 
    status: 200, 
    description: 'The payment has been successfully confirmed.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '9012' },
        status: { type: 'string', enum: Object.values(PaymentStatus), example: PaymentStatus.COMPLETED },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid payment status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  confirmPayment(
    @Body() confirmPaymentDto: ConfirmPaymentDto, 
    @Req() req
  ) {
    return this.paymentsService.confirmPayment(confirmPaymentDto, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new payment (legacy method)' })
  @ApiResponse({ 
    status: 201, 
    description: 'The payment has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '9012' },
        requestId: { type: 'string', format: 'uuid', example: '5678' },
        amount: { type: 'number', example: 229.95 },
        paymentMethod: { type: 'string', enum: Object.values(PaymentMethod), example: PaymentMethod.CREDIT_CARD },
        transactionId: { type: 'string', example: 'trx_7890123456' },
        status: { type: 'string', enum: Object.values(PaymentStatus), example: PaymentStatus.COMPLETED },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid payment details or already paid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    return this.paymentsService.create(createPaymentDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all payments by current user' })
  @ApiResponse({ 
    status: 200,
    description: 'List of payments by the current user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          rentalRequestId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          paymentMethod: { type: 'string', enum: Object.values(PaymentMethod) },
          transactionId: { type: 'string' },
          status: { type: 'string', enum: Object.values(PaymentStatus) },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          rentalRequest: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              car: {
                type: 'object',
                properties: {
                  make: { type: 'string' },
                  model: { type: 'string' },
                  year: { type: 'integer' },
                  color: { type: 'string' },
                  licensePlate: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req) {
    return this.paymentsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get specific payment details' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200,
    description: 'Payment details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        rentalRequestId: { type: 'string', format: 'uuid' },
        amount: { type: 'number' },
        paymentMethod: { type: 'string', enum: Object.values(PaymentMethod) },
        transactionId: { type: 'string' },
        status: { type: 'string', enum: Object.values(PaymentStatus) },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        rentalRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            totalCost: { type: 'number' },
            car: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                make: { type: 'string' },
                model: { type: 'string' },
                year: { type: 'integer' },
                color: { type: 'string' },
                licensePlate: { type: 'string' }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancel/refund payment' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment successfully refunded',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: Object.values(PaymentStatus), example: PaymentStatus.REFUNDED },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot refund non-completed payment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  cancel(@Param('id') id: string, @Req() req) {
    return this.paymentsService.cancelPayment(id, req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiHeader({ name: 'stripe-signature', required: true, description: 'Stripe webhook signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    
    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }
    
    await this.paymentsService.handleWebhook(signature, req.rawBody);
    
    return { received: true };
  }
}
