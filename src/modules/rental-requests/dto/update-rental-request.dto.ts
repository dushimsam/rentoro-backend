import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RentalRequestStatus } from '../entities/rental-request.entity';

export class UpdateRentalRequestDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'New start date and time of rental period', required: false })
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'New end date and time of rental period', required: false })
  endDate?: Date;

  @IsOptional()
  @ApiProperty({ description: 'New status of the rental request', required: false })
  status?: RentalRequestStatus;
}
