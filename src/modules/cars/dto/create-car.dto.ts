import { IsString, IsNumber, IsPositive, Min, IsOptional, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ 
    description: 'Car manufacturer', 
    example: 'Toyota' 
  })
  make: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ 
    description: 'Car model', 
    example: 'Camry' 
  })
  model: string;

  @IsNumber()
  @Min(1900)
  @ApiProperty({ 
    description: 'Manufacturing year', 
    example: 2022,
    minimum: 1900
  })
  year: number;

  @IsString()
  @MaxLength(20)
  @ApiProperty({ 
    description: 'License plate number', 
    example: 'ABC123' 
  })
  licensePlate: string;

  @IsString()
  @MaxLength(50)
  @ApiProperty({ 
    description: 'Car color', 
    example: 'Silver' 
  })
  color: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({ 
    description: 'Daily rental rate', 
    example: 45.99,
    minimum: 0
  })
  dailyRate: number;

  @IsString()
  @MaxLength(200)
  @ApiProperty({ 
    description: 'Car location', 
    example: 'New York, NY' 
  })
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @ApiProperty({ 
    description: 'Car description', 
    example: 'Fuel-efficient sedan with excellent condition',
    required: false
  })
  description?: string;
}
