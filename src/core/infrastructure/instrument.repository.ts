import { Inject, Injectable } from "@nestjs/common";
import { InstrumentRepository } from "../domain/repositories/instrument.repository";
import { DATABASE_CONNECTION } from "src/database/database.provider";
import { Kysely } from "kysely";
import { DB } from "src/database/database-types";
import { Instrument } from "../domain/models/instrument";

@Injectable()
export class InstrumentRepositoryImpl implements InstrumentRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly database: Kysely<DB>) {
    }

    async getInstrument(instrumentId: Instrument['id']): Promise<Instrument | null> {
        const data = await this.database
            .selectFrom('instruments')
            .where('id', '=', parseInt(instrumentId))
            .selectAll()
            .executeTakeFirst();

        if (!data) {
            return null;
        }

        return this.mapDbToDomain(data);
    }

    private mapDbToDomain(data: Record<string, unknown>) {
        return Instrument.fromDb({
            id: data.id as number,
            ticker: data.ticker as string,
            name: data.name as string,
            type: data.type as string
        });
    }
}
