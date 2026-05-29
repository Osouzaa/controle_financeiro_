import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, RequestUser } from '../../auth/auth-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateFixedBillDto, FixedBillChecklistQueryDto, ToggleFixedBillPaymentDto } from './fixed-bills.dto';
import { FixedBillsService } from './fixed-bills.service';

@ApiTags('fixed-bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fixed-bills')
export class FixedBillsController {
  constructor(private readonly service: FixedBillsService) {}

  @Get()
  findAll(@AuthUser() user: RequestUser) {
    return this.service.findAll(user.sub);
  }

  @Get('checklist')
  checklist(@AuthUser() user: RequestUser, @Query() query: FixedBillChecklistQueryDto) {
    return this.service.checklist(user.sub, query.month, query.year);
  }

  @Post()
  create(@AuthUser() user: RequestUser, @Body() dto: CreateFixedBillDto) {
    return this.service.create(user.sub, dto);
  }

  @Patch(':id')
  update(@AuthUser() user: RequestUser, @Param('id') id: string, @Body() dto: Partial<CreateFixedBillDto>) {
    return this.service.update(user.sub, id, dto);
  }

  @Patch(':id/checklist')
  togglePayment(@AuthUser() user: RequestUser, @Param('id') id: string, @Body() dto: ToggleFixedBillPaymentDto) {
    return this.service.togglePayment(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.sub, id);
  }
}
