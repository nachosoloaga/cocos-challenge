import { Controller, Get, Query } from '@nestjs/common';
import { MarketApplicationService } from '../application/services/market.service';
import { InstrumentDto } from './dtos/instrument.response.dto';
import { InstrumentSearchDto } from './dtos/instrument-search.request.dto';
import { Instrument } from '../domain/models/instrument';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketApplicationService: MarketApplicationService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Empty array if no instruments found',
    type: [InstrumentDto],
  })
  @ApiOperation({
    summary: 'Search for instruments',
    description: 'Search for instruments by ticker or name',
  })
  @ApiQuery({ type: InstrumentSearchDto })
  @Get('instruments/search')
  async searchInstruments(
    @Query() query: InstrumentSearchDto,
  ): Promise<InstrumentDto[]> {
    const res = await this.marketApplicationService.searchInstruments(query);

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
