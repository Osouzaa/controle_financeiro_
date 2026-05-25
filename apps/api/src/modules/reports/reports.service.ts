import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Repository } from 'typeorm';
import { PaymentMethod, TransactionStatus, TransactionType } from '../../common/enums';
import { Transaction } from '../../database/entities';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Transaction) private readonly repo: Repository<Transaction>) {}

  async yearly(userId: string, year: number) {
    const rows = await this.repo.find({ where: { userId }, relations: { category: true, card: true } });
    const active = rows.filter((t) => t.status !== TransactionStatus.CANCELED);
    const monthly = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(year, index);
      const from = format(startOfMonth(date), 'yyyy-MM-dd');
      const to = format(endOfMonth(date), 'yyyy-MM-dd');
      const monthRows = active.filter((t) => this.effectiveDate(t) >= from && this.effectiveDate(t) <= to);
      return {
        month: format(date, 'MM/yyyy'),
        receitas: this.sum(monthRows, TransactionType.INCOME),
        despesas: this.sum(monthRows, TransactionType.EXPENSE),
      };
    });

    return {
      monthly,
      byCategory: this.group(active.filter((t) => t.type === TransactionType.EXPENSE), (t) => t.category?.nome || 'Sem categoria'),
      byCard: this.group(active.filter((t) => t.cardId), (t) => t.card?.nome || 'Sem cartão'),
    };
  }

  private sum(rows: Transaction[], type: TransactionType) {
    return rows.filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.valor), 0);
  }

  private group(rows: Transaction[], keyFn: (row: Transaction) => string) {
    return Object.values(
      rows.reduce<Record<string, { name: string; value: number }>>((acc, row) => {
        const key = keyFn(row);
        acc[key] ??= { name: key, value: 0 };
        acc[key].value += Number(row.valor);
        return acc;
      }, {}),
    );
  }

  private effectiveDate(transaction: Transaction) {
    if (transaction.paymentMethod === PaymentMethod.CREDIT_CARD) {
      return transaction.dueDate || transaction.data;
    }
    return transaction.data;
  }
}
