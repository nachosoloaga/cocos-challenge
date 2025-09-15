import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioApplicationService } from '../application/services/portfolio.service';
import { PositionDto } from './dtos/position.dto';
import { Position } from '../domain/models/position';

@Controller('users')
export class UserController {
  constructor(
    private readonly portfolioApplicationService: PortfolioApplicationService,
  ) {}

  @Get(':userId/portfolio')
  async getPortfolio(@Param('userId') userId: number): Promise<{
    positions: PositionDto[];
    totalCashAmount: number;
    totalAccountValue: number;
  }> {
    const { positionsMap, totalCashAmount, totalAccountValue } =
      await this.portfolioApplicationService.getPortfolio(userId);

    return {
      positions: this.mapPositionsToDto(positionsMap),
      totalCashAmount,
      totalAccountValue,
    };
  }

  mapPositionsToDto(positionsMap: Map<number, Position>): PositionDto[] {
    const positions: PositionDto[] = [];
    for (const [instrumentId, position] of positionsMap) {
      positions.push({
        instrumentId,
        currentTotalValue: position.currentTotalValue,
        totalReturnPercentage: position.totalReturnPercentage,
        quantity: position.quantity,
      });
    }

    return positions;
  }
}
