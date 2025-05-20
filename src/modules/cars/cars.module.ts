import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { CarsGrpcController } from './cars.grpc.controller'; // Added import
import { Car } from './entities/car.entity';
import { RentalRequestsModule } from '../rental-requests/rental-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    forwardRef(() => RentalRequestsModule)
  ],
  controllers: [CarsController, CarsGrpcController], // Added CarsGrpcController
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
