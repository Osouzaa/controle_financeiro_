import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatus, TransactionType } from '../../common/enums';
import { FixedBill, FixedBillPayment, Transaction } from '../../database/entities';
import { CreateFixedBillDto, ToggleFixedBillPaymentDto } from './fixed-bills.dto';

@Injectable()
export class FixedBillsService {
  constructor(
    @InjectRepository(FixedBill) private readonly fixedBills: Repository<FixedBill>,
    @InjectRepository(FixedBillPayment) private readonly payments: Repository<FixedBillPayment>,
    @InjectRepository(Transaction) private readonly transactions: Repository<Transaction>,
  ) {}

  findAll(userId: string) {
    return this.fixedBills.find({ where: { userId }, order: { nome: 'ASC' } });
  }

  create(userId: string, dto: CreateFixedBillDto) {
    return this.fixedBills.save({
      nome: dto.nome,
      valor: dto.valor || undefined,
      endDate: dto.endDate || undefined,
      ativo: dto.ativo ?? true,
      userId,
    });
  }

  async update(userId: string, id: string, dto: Partial<CreateFixedBillDto>) {
    const item = await this.findOne(userId, id);
    Object.assign(item, dto);
    return this.fixedBills.save(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.fixedBills.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Conta fixa nao encontrada.');
    return { ok: true };
  }

  async checklist(userId: string, month: number, year: number) {
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const bills = await this.fixedBills.find({
      where: { userId, ativo: true },
      order: { nome: 'ASC' },
    });
    const payments = await this.payments.find({
      where: { userId, month, year },
    });
    const paymentByBill = new Map(payments.map((payment) => [payment.fixedBillId, payment]));
    const items = bills.filter((bill) => !bill.endDate || bill.endDate >= monthStart).map((bill) => {
      const payment = paymentByBill.get(bill.id);
      return {
        id: bill.id,
        nome: bill.nome,
        valor: bill.valor,
        endDate: bill.endDate,
        paid: payment?.paid ?? false,
        paidAt: payment?.paidAt,
        paymentId: payment?.id,
        transactionId: payment?.transactionId,
      };
    });
    const paidCount = items.filter((item) => item.paid).length;
    const totalAmount = items.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    const paidAmount = items.filter((item) => item.paid).reduce((acc, item) => acc + Number(item.valor || 0), 0);

    return {
      month,
      year,
      items,
      summary: {
        total: items.length,
        paid: paidCount,
        pending: items.length - paidCount,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
      },
    };
  }

  async togglePayment(userId: string, fixedBillId: string, dto: ToggleFixedBillPaymentDto) {
    await this.findOne(userId, fixedBillId);
    const existing = await this.payments.findOne({
      where: { userId, fixedBillId, month: dto.month, year: dto.year },
    });

    const payment =
      existing ||
      this.payments.create({
        userId,
        fixedBillId,
        month: dto.month,
        year: dto.year,
      });

    payment.paid = dto.paid;
    payment.paidAt = dto.paid ? new Date() : undefined;

    if (dto.paid && !payment.transactionId) {
      const bill = await this.findOne(userId, fixedBillId);
      if (bill.valor) {
        const paymentDate = this.resolvePaymentDate(dto.month, dto.year);
        const transaction = await this.transactions.save({
          type: TransactionType.EXPENSE,
          descricao: bill.nome,
          valor: bill.valor,
          data: paymentDate,
          status: TransactionStatus.PAID,
          userId,
          isInstallment: false,
        });
        payment.transactionId = transaction.id;
      }
    }

    if (!dto.paid && payment.transactionId) {
      await this.transactions.delete({ id: payment.transactionId, userId });
      payment.transactionId = undefined;
    }

    await this.payments.save(payment);
    return this.checklist(userId, dto.month, dto.year);
  }

  private resolvePaymentDate(month: number, year: number) {
    const today = new Date();
    const selectedCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
    const day = selectedCurrentMonth ? today.getDate() : new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private async findOne(userId: string, id: string) {
    const item = await this.fixedBills.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Conta fixa nao encontrada.');
    return item;
  }
}
