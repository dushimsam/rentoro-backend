import { IsString, IsEnum, IsOptional, Length, IsNumber, Min, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the rental request' })
  requestId: string;

  @IsEnum(PaymentMethod)
  @ApiProperty({ 
    description: 'Payment method', 
    enum: PaymentMethod, 
    example: PaymentMethod.CREDIT_CARD 
  })
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @Length(13, 19)
  @ApiProperty({ 
    description: 'Credit card number (only required for CREDIT_CARD payment method)', 
    required: false 
  })
  cardNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiProperty({ 
    description: 'Expiry month (only required for CREDIT_CARD payment method)', 
    required: false 
  })
  expiryMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(2023)
  @ApiProperty({ 
    description: 'Expiry year (only required for CREDIT_CARD payment method)', 
    required: false 
  })
  expiryYear?: number;

  @IsOptional()
  @IsString()
  @Length(3, 4)
  @ApiProperty({ 
    description: 'CVV code (only required for CREDIT_CARD payment method)', 
    required: false 
  })
  cvv?: string;
}
