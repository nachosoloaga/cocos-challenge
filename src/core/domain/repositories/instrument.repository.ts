import { Instrument } from '../models/instrument';
import { InstrumentQueryObject } from '../queries/instrument.query-object';

export interface InstrumentRepository {
  find(query: InstrumentQueryObject): Promise<Instrument[]>;
  findOne(query: InstrumentQueryObject): Promise<Instrument | null>;
}

export const INSTRUMENT_REPOSITORY = 'INSTRUMENT_REPOSITORY';
