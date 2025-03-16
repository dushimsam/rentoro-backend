import { Module } from '@nestjs/common';
import { AppConfigModule } from './configs/app-configs.module';
import { FounderModule } from './modules/founders/founder.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './configs/app-configs.service';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    FounderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
