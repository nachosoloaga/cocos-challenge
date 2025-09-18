import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioApplicationService } from '../application/services/portfolio.application.service';
import { GetPortfolioResponseDto } from './dtos/get-portfolio.response.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(
    private readonly portfolioApplicationService: PortfolioApplicationService,
  ) {}

  @Get(':userId/portfolio')
  @ApiOperation({
    summary: "Get a user's portfolio",
    description:
      "Get a user's portfolio with current stock positions, available cash to operate and total account value",
  })
  @ApiResponse({
    status: 200,
    description: "User's portfolio",
    type: GetPortfolioResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiParam({ name: 'userId', type: Number })
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
