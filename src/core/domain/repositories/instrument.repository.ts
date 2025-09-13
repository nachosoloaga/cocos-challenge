import { Instrument } from '../models/instrument';

export interface InstrumentRepository {
  findById(instrumentId: Instrument['id']): Promise<Instrument | null>;

  findAll(): Promise<Instrument[]>;
}

export const INSTRUMENT_REPOSITORY = 'INSTRUMENT_REPOSITORY';
