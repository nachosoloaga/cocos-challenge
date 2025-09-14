import { Inject, Injectable } from '@nestjs/common';
import { InstrumentRepository } from 'src/core/domain/repositories/instrument.repository';
import { INSTRUMENT_REPOSITORY } from 'src/core/domain/repositories/instrument.repository';
import { Instrument } from 'src/core/domain/models/instrument';
import { InstrumentDto } from 'src/core/api/dtos/instrument.dto';

@Injectable()
export class MarketApplicationService {
  constructor(
    @Inject(INSTRUMENT_REPOSITORY)
    private readonly instrumentRepository: InstrumentRepository,
  ) {}

  async searchAssets(query: string): Promise<InstrumentDto[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const instruments = await this.instrumentRepository.searchByTickerOrName(
      query.trim(),
    );

    return instruments.map((instrument) => this.mapToDto(instrument));
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
