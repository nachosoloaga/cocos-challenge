import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioApplicationService } from '../application/services/portfolio.service';
import { GetPortfolioResponseDto } from './dtos/get-portfolio.response.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly portfolioApplicationService: PortfolioApplicationService,
  ) {}

  @Get(':userId/portfolio')
  async getPortfolio(
    @Param('userId') userId: number,
  ): Promise<GetPortfolioResponseDto> {
    const { stockPositions, totalCash, totalAccountValue } =
      await this.portfolioApplicationService.getPortfolio(userId);

    return {
      stockPositions,
      totalCash,
      totalAccountValue,
    };
  }
}
