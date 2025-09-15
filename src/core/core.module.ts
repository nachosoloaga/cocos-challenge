import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MarketApplicationService } from './application/services/market.service';
import { UserController } from './api/users.controller';
import { MarketController } from './api/market.controller';
import { PortfolioApplicationService } from './application/services/portfolio.service';
import { UserRepositoryImpl } from './infrastructure/user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { InstrumentRepositoryImpl } from './infrastructure/instrument.repository';
import { INSTRUMENT_REPOSITORY } from './domain/repositories/instrument.repository';
import { MarketdataRepositoryImpl } from './infrastructure/marketdata.repository';
import { MARKETDATA_REPOSITORY } from './domain/repositories/marketdata.repository';
import { OrderRepositoryImpl } from './infrastructure/order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository';
import { CashCalculatorService } from './domain/services/cash-calculator.service';
import { PositionCalculatorService } from './domain/services/position-calculator.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController, MarketController],
  providers: [
    MarketApplicationService,
    PortfolioApplicationService,
    CashCalculatorService,
    PositionCalculatorService,
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
