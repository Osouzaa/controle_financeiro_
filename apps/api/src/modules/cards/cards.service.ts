import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, Transaction } from '../../database/entities';
import { PaymentMethod, TransactionStatus } from '../../common/enums';
import { CreateCardDto } from './cards.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private readonly repo: Repository<Card>,
    @InjectRepository(Transaction) private readonly transactions: Repository<Transaction>,
  ) {}

  async findAll(userId: string) {
    const cards = await this.repo.find({ where: { userId }, order: { nome: 'ASC' } });
    const totals = await this.transactions
      .createQueryBuilder('t')
      .select('t.cardId', 'cardId')
      .addSelect('COALESCE(SUM(t.valor), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.paymentMethod = :method', { method: PaymentMethod.CREDIT_CARD })
      .andWhere('t.status != :canceled', { canceled: TransactionStatus.CANCELED })
      .groupBy('t.cardId')
      .getRawMany<{ cardId: string; total: string }>();
    const totalMap = new Map(totals.map((item) => [item.cardId, Number(item.total)]));
    return cards.map((card) => {
      const gasto = totalMap.get(card.id) ?? 0;
      const limite = Number(card.limite);
      return { ...card, gasto, limiteRestante: limite - gasto, percentualUtilizado: limite ? (gasto / limite) * 100 : 0 };
    });
  }

  create(userId: string, dto: CreateCardDto) {
    return this.repo.save({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: Partial<CreateCardDto>) {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Cartão não encontrado.');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Cartão não encontrado.');
    return { ok: true };
  }
}
