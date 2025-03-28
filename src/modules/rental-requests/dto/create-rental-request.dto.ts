import { IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRentalRequestDto {
  @IsUUID()
  @ApiProperty({ description: 'UUID of the car to rent' })
  carId: string;

  @IsDateString()
  @ApiProperty({ description: 'Start date and time of rental period', example: '2025-04-01T10:00:00Z' })
  startDate: string;

  @IsDateString()
  @ApiProperty({ description: 'End date and time of rental period', example: '2025-04-05T18:00:00Z' })
  endDate: string;
}
