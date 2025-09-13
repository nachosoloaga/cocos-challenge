import { Instrument } from "../models/instrument";

export interface InstrumentRepository {
    getInstrument(instrumentId: Instrument['id']): Promise<Instrument | null>;
}

export const INSTRUMENT_REPOSITORY = 'INSTRUMENT_REPOSITORY';
