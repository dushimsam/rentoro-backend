import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the rental request' })
  requestId: string;
}
