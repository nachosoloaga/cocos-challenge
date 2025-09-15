import { Inject, Injectable } from '@nestjs/common';
import { InstrumentRepository } from 'src/core/domain/repositories/instrument.repository';
import { INSTRUMENT_REPOSITORY } from 'src/core/domain/repositories/instrument.repository';
import { Instrument } from 'src/core/domain/models/instrument';
import { AssetSearchDto } from 'src/core/api/dtos/asset-search.dto';
import { InstrumentQueryObject } from 'src/core/domain/queries/instrument.query-object';

@Injectable()
export class MarketApplicationService {
  constructor(
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
  ) {}

  async searchAssets(query: AssetSearchDto): Promise<Instrument[]> {
    if (!query) {
      return [];
    }

    const instruments = await this.instrumentRepository.find(
      InstrumentQueryObject.searchByTickerOrName(query.ticker, query.name),
    );

    return instruments;
  }
}
