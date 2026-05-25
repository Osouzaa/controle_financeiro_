import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card, Transaction } from '../../database/entities';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Card])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
