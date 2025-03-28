import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RentalRequestsService } from './rental-requests.service';
import { CreateRentalRequestDto } from './dto/create-rental-request.dto';
import { UpdateRentalRequestDto } from './dto/update-rental-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RentalRequestStatus } from './entities/rental-request.entity';

@ApiTags('rental-requests')
@Controller('rental-requests')
export class RentalRequestsController {
  constructor(private readonly rentalRequestsService: RentalRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new rental request' })
  @ApiResponse({ 
    status: 201, 
    description: 'The rental request has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        carId: { type: 'string', format: 'uuid' },
        clientId: { type: 'string', format: 'uuid' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: Object.values(RentalRequestStatus), default: RentalRequestStatus.PENDING },
        totalCost: { type: 'number', example: 229.95 },
        createdAt: { type: 'string', format: 'date-time' },
        car: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            make: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Camry' },
            year: { type: 'integer', example: 2022 },
            color: { type: 'string', example: 'Silver' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid dates or unavailable car' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createRentalRequestDto: CreateRentalRequestDto, @Req() req) {
    return this.rentalRequestsService.create(createRentalRequestDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all rental requests by current user' })
  @ApiResponse({ 
    status: 200,
    description: 'List of rental requests by the current user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          carId: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: Object.values(RentalRequestStatus) },
          totalCost: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Req() req) {
    return this.rentalRequestsService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get specific rental request details' })
  @ApiParam({ name: 'id', description: 'Rental request ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200,
    description: 'Rental request details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        carId: { type: 'string', format: 'uuid' },
        clientId: { type: 'string', format: 'uuid' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: Object.values(RentalRequestStatus) },
        totalCost: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        car: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            make: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            color: { type: 'string' },
            licensePlate: { type: 'string' },
            dailyRate: { type: 'number' },
            location: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your rental request' })
  @ApiResponse({ status: 404, description: 'Rental request not found' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.rentalRequestsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update rental request (e.g., dates)' })
  @ApiParam({ name: 'id', description: 'Rental request ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Rental request updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        carId: { type: 'string', format: 'uuid' },
        clientId: { type: 'string', format: 'uuid' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        status: { type: 'string', enum: Object.values(RentalRequestStatus) },
        totalCost: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid dates or non-pending request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your rental request' })
  @ApiResponse({ status: 404, description: 'Rental request not found' })
  update(
    @Param('id') id: string, 
    @Body() updateRentalRequestDto: UpdateRentalRequestDto, 
    @Req() req
  ) {
    return this.rentalRequestsService.update(id, updateRentalRequestDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancel rental request' })
  @ApiParam({ name: 'id', description: 'Rental request ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Rental request cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot cancel non-pending request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your rental request' })
  @ApiResponse({ status: 404, description: 'Rental request not found' })
  remove(@Param('id') id: string, @Req() req) {
    return this.rentalRequestsService.remove(id, req.user.id);
  }
}