import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths, format } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { PaymentMethod, TransactionStatus, TransactionType } from '../../common/enums';
import { Transaction } from '../../database/entities';
import { CreateTransactionDto, TransactionQueryDto } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private readonly repo: Repository<Transaction>) {}

  async findAll(userId: string, query: TransactionQueryDto) {
    const where: FindOptionsWhere<Transaction> = { userId };
    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.accountId) where.accountId = query.accountId;
    if (query.cardId) where.cardId = query.cardId;
    if (query.from && query.to) where.data = Between(query.from, query.to);

    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const [items, total] = await this.repo.findAndCount({
      where,
      relations: { category: true, account: true, card: true },
      order: { data: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const totalParcelas = dto.parcelas ?? 1;
    if (totalParcelas > 1) {
      return this.createInstallments(userId, dto, totalParcelas);
    }

    const status = dto.status ?? this.defaultStatus(dto);
    return this.repo.save({ ...dto, userId, status, isInstallment: false });
  }

  async markPaid(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    item.status = TransactionStatus.PAID;
    item.paidAt = new Date();
    return this.repo.save(item);
  }

  async update(userId: string, id: string, dto: Partial<CreateTransactionDto>) {
    const item = await this.findOne(userId, id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async cancel(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    if (item.installmentGroupId) {
      await this.repo.update({ userId, installmentGroupId: item.installmentGroupId }, { status: TransactionStatus.CANCELED });
      return { ok: true };
    }
    item.status = TransactionStatus.CANCELED;
    await this.repo.save(item);
    return { ok: true };
  }

  async remove(userId: string, id: string) {
    const item = await this.findOne(userId, id);
    if (item.installmentGroupId) {
      await this.repo.delete({ userId, installmentGroupId: item.installmentGroupId });
      return { ok: true };
    }
    await this.repo.delete({ id, userId });
    return { ok: true };
  }

  futureInstallments(userId: string) {
    return this.repo.find({
      where: { userId, isInstallment: true, status: TransactionStatus.PENDING },
      relations: { card: true, category: true },
      order: { dueDate: 'ASC' },
      take: 120,
    });
  }

  private async findOne(userId: string, id: string) {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Lançamento não encontrado.');
    return item;
  }

  private createInstallments(userId: string, dto: CreateTransactionDto, totalParcelas: number) {
    const groupId = randomUUID();
    const total = Number(dto.valor);
    const parcelaValor = Math.round((total / totalParcelas) * 100) / 100;
    const start = new Date(`${dto.data}T12:00:00`);

    const rows = Array.from({ length: totalParcelas }, (_, index) => {
      const number = index + 1;
      const dueDate = format(addMonths(start, index), 'yyyy-MM-dd');
      return this.repo.create({
        ...dto,
        userId,
        descricao: `${dto.descricao} ${number}/${totalParcelas}`,
        valor: parcelaValor.toFixed(2),
        status: index === 0 ? this.defaultStatus(dto) : TransactionStatus.PENDING,
        isInstallment: true,
        installmentGroupId: groupId,
        installmentNumber: number,
        installmentTotal: totalParcelas,
        totalAmount: total.toFixed(2),
        data: dueDate,
        dueDate,
      });
    });

    return this.repo.save(rows);
  }

  private defaultStatus(dto: CreateTransactionDto) {
    if (dto.type === TransactionType.INCOME) return TransactionStatus.PAID;
    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) return TransactionStatus.PENDING;
    return TransactionStatus.PAID;
  }
}
