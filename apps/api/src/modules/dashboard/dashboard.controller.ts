import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, RequestUser } from '../../auth/auth-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  summary(@AuthUser() user: RequestUser, @Query('month') month?: string, @Query('year') year?: string) {
    return this.service.summary(user.sub, month ? Number(month) : undefined, year ? Number(year) : undefined);
  }
}
