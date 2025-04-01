import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'The Stripe payment intent ID', 
    example: 'pi_123456789' 
  })
  paymentIntentId: string;
}
