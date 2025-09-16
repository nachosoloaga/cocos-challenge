import { Controller, Get, Query } from '@nestjs/common';
import { MarketApplicationService } from '../application/services/market.service';
import { InstrumentDto } from './dtos/instrument.response.dto';
import { AssetSearchDto } from './dtos/asset-search.request.dto';
import { Instrument } from '../domain/models/instrument';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketApplicationService: MarketApplicationService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Empty array if no assets found',
    type: [InstrumentDto],
  })
  @ApiOperation({
    summary: 'Search for assets',
    description: 'Search for assets by ticker or name',
  })
  @ApiQuery({ type: AssetSearchDto })
  @Get('assets/search')
  async searchAssets(@Query() query: AssetSearchDto): Promise<InstrumentDto[]> {
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
