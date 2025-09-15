import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioApplicationService } from '../application/services/portfolio.service';
import { PositionDto } from './dtos/position.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly portfolioApplicationService: PortfolioApplicationService,
  ) {}

  @Get(':userId/portfolio')
  async getPortfolio(@Param('userId') userId: number): Promise<{
    positions: PositionDto[];
    totalCash: number;
    totalAccountValue: number;
  }> {
    const { positions, totalCash, totalAccountValue } =
      await this.portfolioApplicationService.getPortfolio(userId);

    return {
      positions,
      totalCash,
      totalAccountValue,
    };
  }
}
