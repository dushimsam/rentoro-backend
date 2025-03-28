import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { RentalRequestsModule } from '../rental-requests/rental-requests.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    RentalRequestsModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
