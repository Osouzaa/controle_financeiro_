import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, RequestUser } from '../../auth/auth-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateTransactionDto, TransactionQueryDto } from './transactions.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  findAll(@AuthUser() user: RequestUser, @Query() query: TransactionQueryDto) {
    return this.service.findAll(user.sub, query);
  }

  @Get('future-installments')
  futureInstallments(@AuthUser() user: RequestUser) {
    return this.service.futureInstallments(user.sub);
  }

  @Post()
  create(@AuthUser() user: RequestUser, @Body() dto: CreateTransactionDto) {
    return this.service.create(user.sub, dto);
  }

  @Patch(':id')
  update(@AuthUser() user: RequestUser, @Param('id') id: string, @Body() dto: Partial<CreateTransactionDto>) {
    return this.service.update(user.sub, id, dto);
  }

  @Patch(':id/pay')
  markPaid(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.markPaid(user.sub, id);
  }

  @Patch(':id/cancel')
  cancel(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.cancel(user.sub, id);
  }

  @Delete(':id')
  remove(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.sub, id);
  }
}
