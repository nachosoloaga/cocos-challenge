import { Controller, Get, Query } from '@nestjs/common';
import { MarketApplicationService } from '../application/services/market.service';
import { InstrumentDto } from './dtos/instrument.dto';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketApplicationService: MarketApplicationService,
  ) {}

  @Get('assets/search')
  async searchAssets(@Query('q') query: string): Promise<InstrumentDto[]> {
    return this.marketApplicationService.searchAssets(query);
  }
}
