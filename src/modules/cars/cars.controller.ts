import { Controller, Get, Post, Put, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { RentalRequestsService } from '../rental-requests/rental-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UpdateCarAvailabilityDto } from './dto/update-car-availability.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly rentalRequestsService: RentalRequestsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Register a new car' })
  @ApiResponse({ 
    status: 201, 
    description: 'The car has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        make: { type: 'string', example: 'Toyota' },
        model: { type: 'string', example: 'Camry' },
        year: { type: 'integer', example: 2022 },
        licensePlate: { type: 'string', example: 'ABC123' },
        color: { type: 'string', example: 'Silver' },
        dailyRate: { type: 'number', example: 45.99 },
        isAvailable: { type: 'boolean', example: true },
        isValidated: { type: 'boolean', example: false },
        location: { type: 'string', example: 'New York, NY' },
        description: { type: 'string', example: 'Fuel-efficient sedan with excellent condition' },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        imageUrls: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCarDto: CreateCarDto, @Req() req) {
    return this.carsService.create(createCarDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all available cars with optional filters' })
  @ApiResponse({ 
    status: 200,
    description: 'List of available cars',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          make: { type: 'string', example: 'Toyota' },
          model: { type: 'string', example: 'Camry' },
          year: { type: 'integer', example: 2022 },
          licensePlate: { type: 'string', example: 'ABC123' },
          color: { type: 'string', example: 'Silver' },
          dailyRate: { type: 'number', example: 45.99 },
          isAvailable: { type: 'boolean', example: true },
          isValidated: { type: 'boolean', example: true },
          location: { type: 'string', example: 'New York, NY' },
          description: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiQuery({ name: 'make', required: false, description: 'Filter by car make' })
  @ApiQuery({ name: 'model', required: false, description: 'Filter by car model' })
  @ApiQuery({ name: 'minYear', required: false, description: 'Minimum manufacturing year' })
  @ApiQuery({ name: 'maxYear', required: false, description: 'Maximum manufacturing year' })
  @ApiQuery({ name: 'minDailyRate', required: false, description: 'Minimum daily rate' })
  @ApiQuery({ name: 'maxDailyRate', required: false, description: 'Maximum daily rate' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by location' })
  findAll(
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('minYear') minYear?: number,
    @Query('maxYear') maxYear?: number,
    @Query('minDailyRate') minDailyRate?: number,
    @Query('maxDailyRate') maxDailyRate?: number,
    @Query('location') location?: string,
  ) {
    const filters = {
      make,
      model,
      minYear,
      maxYear,
      minDailyRate,
      maxDailyRate,
      location,
    };
    return this.carsService.findAll(filters);
  }

  @Get('all')
  @ApiOperation({ summary: 'List all cars regardless of availability or validation status' })
  @ApiResponse({ 
    status: 200,
    description: 'Complete list of all cars in the system',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          licensePlate: { type: 'string' },
          color: { type: 'string' },
          dailyRate: { type: 'number' },
          isAvailable: { type: 'boolean' },
          isValidated: { type: 'boolean' },
          location: { type: 'string' },
          description: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  findAllCars() {
    return this.carsService.findAllCars();
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all cars registered by current user' })
  @ApiResponse({ 
    status: 200,
    description: 'List of cars registered by the current user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'integer' },
          licensePlate: { type: 'string' },
          color: { type: 'string' },
          dailyRate: { type: 'number' },
          isAvailable: { type: 'boolean' },
          isValidated: { type: 'boolean' },
          location: { type: 'string' },
          description: { type: 'string' },
          ownerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOwnerCars(@Req() req) {
    return this.carsService.findOwnerCars(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific car details' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200,
    description: 'Car details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        make: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'integer' },
        licensePlate: { type: 'string' },
        color: { type: 'string' },
        dailyRate: { type: 'number' },
        isAvailable: { type: 'boolean' },
        isValidated: { type: 'boolean' },
        location: { type: 'string' },
        description: { type: 'string' },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        owner: {
          type: 'object',
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update car details' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Car updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your car' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto, @Req() req) {
    return this.carsService.update(id, updateCarDto, req.user.id);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update car availability' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your car' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  updateAvailability(
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateCarAvailabilityDto,
    @Req() req,
  ) {
    return this.carsService.updateAvailability(id, updateAvailabilityDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove car from listings' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Car removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your car' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  remove(@Param('id') id: string, @Req() req) {
    return this.carsService.remove(id, req.user.id);
  }

  @Get(':id/validation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check validation status' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Validation status',
    schema: {
      type: 'object',
      properties: {
        isValidated: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your car' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  checkValidation(@Param('id') id: string, @Req() req) {
    return this.carsService.checkValidationStatus(id, req.user.id);
  }

  @Get(':id/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'View all rental requests for a car' })
  @ApiParam({ name: 'id', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of rental requests for this car',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'aadc4135-1cb3-4bb2-9c7a-f15dc208aed6' },
          clientId: { type: 'string', format: 'uuid' },
          carId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] },
          totalCost: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your car' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  getRentalRequests(@Param('id') id: string, @Req() req) {
    return this.rentalRequestsService.findRequestsByCar(id, req.user.id);
  }
}