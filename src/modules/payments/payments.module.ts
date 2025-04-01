import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { RentalRequestsModule } from '../rental-requests/rental-requests.module';
import { StripeService } from './services/stripe.service';
import stripeConfig from './config/stripe.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    RentalRequestsModule,
    ConfigModule.forFeature(stripeConfig)
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
