import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, FixedBill, FixedBillPayment, Goal, Transaction } from '../../database/entities';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account, Goal, FixedBill, FixedBillPayment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
