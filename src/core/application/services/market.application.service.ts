import { Inject, Injectable, Logger } from '@nestjs/common';
import { InstrumentRepository } from '../../domain/repositories/instrument.repository';
import { INSTRUMENT_REPOSITORY } from '../../domain/repositories/instrument.repository';
import { Instrument } from '../../domain/models/instrument';
import { InstrumentSearchDto } from '../../api/dtos/instrument-search.request.dto';
import { InstrumentQueryObject } from '../../domain/queries/instrument.query-object';

@Injectable()
export class MarketApplicationService {
  constructor(
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
    private readonly logger: Logger,
  ) {}

  async searchInstruments(query: InstrumentSearchDto): Promise<Instrument[]> {
    if (!query.ticker && !query.name) {
      this.logger.warn('No ticker or name provided');

      return [];
    }

    this.logger.log(
      `Searching for instruments with ticker ${query.ticker} and name ${query.name}`,
    );

    const instruments = await this.instrumentRepository.find(
      InstrumentQueryObject.searchByTickerOrName(query.ticker, query.name),
    );

    return instruments;
  }
}
