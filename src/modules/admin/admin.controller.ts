import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { ValidationDecisionDto } from './dto/validation-decision.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RentalRequestStatus } from '../rental-requests/entities/rental-request.entity';
import { PaymentMethod, PaymentStatus } from '../payments/entities/payment.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          isEmailVerified: { type: 'boolean' },
          roles: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAllUsers(@Req() req) {
    return this.adminService.findAllUsers(req.user);
  }

  @Get('cars')
  @ApiOperation({ summary: 'List all cars (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all cars',
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
          location: { type: 'string' },
          description: { type: 'string' },
          isAvailable: { type: 'boolean' },
          isValidated: { type: 'boolean' },
          ownerId: { type: 'string', format: 'uuid' },
          owner: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAllCars(@Req() req) {
    return this.adminService.findAllCars(req.user);
  }

  @Get('validations')
  @ApiOperation({ summary: 'List all pending validations (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of cars pending validation',
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
          isValidated: { type: 'boolean', example: false },
          owner: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findPendingValidations(@Req() req) {
    return this.adminService.findPendingValidations(req.user);
  }

  @Get('validations/:carId')
  @ApiOperation({ summary: 'Get specific car validation details (admin only)' })
  @ApiParam({ name: 'carId', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Car details for validation',
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
        location: { type: 'string' },
        description: { type: 'string' },
        isValidated: { type: 'boolean' },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' }
          }
        },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  findCarValidationDetails(@Param('carId') carId: string, @Req() req) {
    return this.adminService.findCarValidationDetails(carId, req.user);
  }

  @Post('validations/:carId')
  @ApiOperation({ summary: 'Submit validation decision (admin only)' })
  @ApiParam({ name: 'carId', description: 'Car ID', type: 'string', format: 'uuid' })
  @ApiResponse({ 
    status: 200, 
    description: 'Validation decision submitted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        isValidated: { type: 'boolean' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  submitValidationDecision(
    @Param('carId') carId: string,
    @Body() validationDecisionDto: ValidationDecisionDto,
    @Req() req
  ) {
    return this.adminService.submitValidationDecision(carId, validationDecisionDto, req.user);
  }

  @Get('rental-requests')
  @ApiOperation({ summary: 'List all rental requests (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all rental requests',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          clientId: { type: 'string', format: 'uuid' },
          carId: { type: 'string', format: 'uuid' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: Object.values(RentalRequestStatus) },
          totalCost: { type: 'number' },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          },
          car: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              make: { type: 'string' },
              model: { type: 'string' },
              year: { type: 'integer' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAllRentalRequests(@Req() req) {
    return this.adminService.findAllRentalRequests(req.user);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payments (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all payments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          rentalRequestId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          paymentMethod: { type: 'string', enum: Object.values(PaymentMethod) },
          transactionId: { type: 'string' },
          status: { type: 'string', enum: Object.values(PaymentStatus) },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          },
          rentalRequest: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              startDate: { type: 'string', format: 'date-time' },
              endDate: { type: 'string', format: 'date-time' },
              car: {
                type: 'object',
                properties: {
                  make: { type: 'string' },
                  model: { type: 'string' }
                }
              }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAllPayments(@Req() req) {
    return this.adminService.findAllPayments(req.user);
  }

  // make someone an admin and it's not a dmin requirement to make someone an admin
  @Post('users/:userId/admin')
  @ApiOperation({ summary: 'Make user an admin (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User is now an admin',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        isEmailVerified: { type: 'boolean' },
        roles: { type: 'array', items: { type: 'string' } },
        isActive: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  makeAdmin(@Param('userId') userId: string, @Req() req) {
    return this.adminService.makeAdmin(userId, req.user);
  }
}