import { Inject, Injectable } from '@nestjs/common';
import { InstrumentRepository } from '../../domain/repositories/instrument.repository';
import { INSTRUMENT_REPOSITORY } from '../../domain/repositories/instrument.repository';
import { Instrument } from '../../domain/models/instrument';
import { AssetSearchDto } from '../../api/dtos/asset-search.request.dto';
import { InstrumentQueryObject } from '../../domain/queries/instrument.query-object';

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
