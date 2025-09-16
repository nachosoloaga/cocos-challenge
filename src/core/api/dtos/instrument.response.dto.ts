import { ApiProperty } from '@nestjs/swagger';

export class InstrumentDto {
  @ApiProperty({
    description: 'Instrument ID',
    example: 1,
  })
  id: string;

  @ApiProperty({
    description: 'Instrument ticker',
    example: 'AAPL',
  })
  ticker: string;

  @ApiProperty({
    description: 'Instrument name',
    example: 'Apple Inc.',
  })
  name: string;

  @ApiProperty({
    description: 'Instrument type',
    example: 'stock',
  })
  type: string;

  constructor(id: string, ticker: string, name: string, type: string) {
    this.id = id;
    this.ticker = ticker;
    this.name = name;
    this.type = type;
  }
}
