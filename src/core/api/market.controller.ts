import { Controller, Get } from "@nestjs/common";
import { InstrumentRepository } from "../infrastructure/instrument.repository";

@Controller('market')
export class MarketController {
    constructor(private readonly instrumentRepository: InstrumentRepository) {}

    @Get('test')
    async test() {
        await this.instrumentRepository.find();
    }
}   