import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MarketApplicationService } from './application/services/market.service';
import { MarketController } from './api/market.controller';
import { UserController } from './api/user.controller';
import { UserApplicationService } from './application/services/user.service';
import { UserRepositoryImpl } from './infrastructure/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { InstrumentRepositoryImpl } from './infrastructure/instrument.repository';
import { INSTRUMENT_REPOSITORY } from './domain/repositories/instrument.repository';
import { MarketdataRepositoryImpl } from './infrastructure/marketdata.repository';
import { MARKETDATA_REPOSITORY } from './domain/repositories/marketdata.repository';
import { OrderRepositoryImpl } from './infrastructure/order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository';
import { FiatCalculatorService } from './domain/services/fiat-calculator.service';
import { PositionCalculatorService } from './domain/services/position-calculator.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MarketController, UserController],
  providers: [
    MarketApplicationService,
    UserApplicationService,
    FiatCalculatorService,
    PositionCalculatorService,
    FiatCalculatorService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: INSTRUMENT_REPOSITORY,
      useClass: InstrumentRepositoryImpl,
    },
    {
      provide: MARKETDATA_REPOSITORY,
      useClass: MarketdataRepositoryImpl,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepositoryImpl,
    },
  ],
  exports: [],
})
export class CoreModule {}
