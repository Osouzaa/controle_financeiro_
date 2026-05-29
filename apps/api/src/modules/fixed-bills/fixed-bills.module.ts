import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedBill, FixedBillPayment, Transaction } from '../../database/entities';
import { FixedBillsController } from './fixed-bills.controller';
import { FixedBillsService } from './fixed-bills.service';

@Module({
  imports: [TypeOrmModule.forFeature([FixedBill, FixedBillPayment, Transaction])],
  controllers: [FixedBillsController],
  providers: [FixedBillsService],
})
export class FixedBillsModule {}
