import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketApplicationService } from "./application/services/market.service";
import { MarketController } from "./api/market.controller";
import { InstrumentRepository } from "./infrastructure/instrument.repository";

@Module({
    imports: [DatabaseModule],
    controllers: [MarketController],
    providers: [MarketApplicationService, InstrumentRepository],
    exports: [],
})
export class CoreModule {}