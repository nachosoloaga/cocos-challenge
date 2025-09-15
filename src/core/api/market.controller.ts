import { Controller, Get, Query } from '@nestjs/common';
import { MarketApplicationService } from '../application/services/market.service';
import { InstrumentDto } from './dtos/instrument.dto';
import { AssetSearchDto } from './dtos/assetSearch.dto';
import { Instrument } from '../domain/models/instrument';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketApplicationService: MarketApplicationService,
  ) {}

  @Get('assets/search')
  async searchAssets(
    @Query('query') query: AssetSearchDto,
  ): Promise<InstrumentDto[]> {
    const res = await this.marketApplicationService.searchAssets(query);

    return res.map((instrument) => this.mapToDto(instrument));
  }

  private mapToDto(instrument: Instrument): InstrumentDto {
    return new InstrumentDto(
      instrument.getId(),
      instrument.getTicker(),
      instrument.getName(),
      instrument.getType(),
    );
  }
}
