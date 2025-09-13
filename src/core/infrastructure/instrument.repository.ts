import { Kysely } from "kysely";
import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/database/database.config";
import { DATABASE_CONNECTION } from "src/database/database.provider";

@Injectable()
export class InstrumentRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly database: Kysely<Database>) {
    }

    async find(): Promise<void> {
        const instruments = await this.database.selectFrom('instruments').selectAll().executeTakeFirst();

        console.log('INSTRUMENTS', instruments);
    }
}