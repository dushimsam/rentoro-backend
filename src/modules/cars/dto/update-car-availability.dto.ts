import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarAvailabilityDto {
  @IsBoolean()
  @ApiProperty({ 
    description: 'Whether the car is available for rent', 
    example: true 
  })
  isAvailable: boolean;
}
