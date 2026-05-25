import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card, Transaction } from '../../database/entities';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Transaction])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
