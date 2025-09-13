import { Module } from "@nestjs/common";
import { DatabaseModule } from "src/database/database.module";
import { MarketApplicationService } from "./application/services/market.service";
import { MarketController } from "./api/market.controller";
import { UserController } from "./api/user.controller";
import { UserApplicationService } from "./application/services/user.service";
import { UserRepositoryImpl } from "./infrastructure/user.repository";
import { USER_REPOSITORY } from "./domain/repositories/user.repository";
    
@Module({
    imports: [DatabaseModule],
    controllers: [MarketController, UserController],
    providers: [MarketApplicationService, UserApplicationService, {
        provide: USER_REPOSITORY,
        useClass: UserRepositoryImpl
    }],
    exports: [],
})
export class CoreModule {}