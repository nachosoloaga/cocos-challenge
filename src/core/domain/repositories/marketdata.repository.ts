import { Marketdata } from "../models/marketdata";

export interface MarketdataRepository {
    getMarketdata(marketdataId: Marketdata['id']): Promise<Marketdata | null>;
}

export const MARKETDATA_REPOSITORY = 'MARKETDATA_REPOSITORY';
