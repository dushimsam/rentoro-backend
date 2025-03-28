import { Module } from '@nestjs/common';
import { AppConfigModule } from './configs/app-configs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './configs/app-configs.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CarsModule } from './modules/cars/cars.module';
import { RentalRequestsModule } from './modules/rental-requests/rental-requests.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    AuthModule,
    UsersModule,
    CarsModule,
    RentalRequestsModule,
    PaymentsModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
