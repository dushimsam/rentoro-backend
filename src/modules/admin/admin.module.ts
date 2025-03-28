import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { RentalRequest } from '../rental-requests/entities/rental-request.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Car, RentalRequest, Payment]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
