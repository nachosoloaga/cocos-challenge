import { Marketdata } from '../models/marketdata';
import { MarketdataQueryObject } from '../queries/marketdata.query-object';

export interface MarketdataRepository {
  find(query: MarketdataQueryObject): Promise<Marketdata[]>;
  findOne(query: MarketdataQueryObject): Promise<Marketdata | null>;
}

export const MARKETDATA_REPOSITORY = 'MARKETDATA_REPOSITORY';
