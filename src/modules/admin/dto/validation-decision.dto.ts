import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidationDecisionDto {
  @IsBoolean()
  @ApiProperty({ 
    description: 'Whether the car is approved or rejected', 
    example: true 
  })
  approved: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ 
    description: 'Feedback or reason for rejection (optional)', 
    example: 'Car photos are not clear. Please upload better quality images.',
    required: false 
  })
  notes?: string;
}
