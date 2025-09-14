import { Controller, Get, Param } from '@nestjs/common';
import { UserApplicationService } from '../application/services/user.service';
import { PositionDto } from './dtos/position.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userApplicationService: UserApplicationService,
  ) {}

  @Get(':id/portfolio')
  async getPortfolio(@Param('id') id: number): Promise<{
    positions: { instrumentId: number; position: PositionDto }[];
    totalFiatValue: number;
    totalAccountValue: number;
  }> {
    const { positionsMap, totalFiatValue, totalAccountValue } =
      await this.userApplicationService.getPortfolio(id);

    const positions: { instrumentId: number; position: PositionDto }[] = [];
    for (const [instrumentId, position] of positionsMap) {
      positions.push({
        instrumentId,
        position: {
          currentTotalValue: position.currentTotalValue,
          totalReturnPercentage: position.totalReturnPercentage,
          quantity: position.quantity,
        },
      });
    }

    return {
      positions,
      totalFiatValue,
      totalAccountValue,
    };
  }
}
