import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new payment' })
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
                  year: { type: 'integer' }
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
  @ApiOperation({ summary: 'Payment gateway webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}