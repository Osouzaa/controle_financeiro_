import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Repository } from 'typeorm';
import { PaymentMethod, TransactionStatus, TransactionType } from '../../common/enums';
import { Account, Goal, Transaction } from '../../database/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction) private readonly transactions: Repository<Transaction>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    @InjectRepository(Goal) private readonly goals: Repository<Goal>,
  ) {}

  async summary(userId: string, month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
    const from = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const to = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    const [transactions, accounts, goals] = await Promise.all([
      this.transactions.find({
        where: { userId },
        relations: { category: true, card: true },
      }),
      this.accounts.find({ where: { userId, ativo: true } }),
      this.goals.find({ where: { userId } }),
    ]);

    const monthRows = transactions.filter((t) => t.data >= from && t.data <= to && t.status !== TransactionStatus.CANCELED);
    const paidRows = monthRows.filter((t) => t.status === TransactionStatus.PAID);
    const incomeMonth = this.sum(monthRows, TransactionType.INCOME);
    const expenseMonth = this.sum(monthRows, TransactionType.EXPENSE);
    const paidIncome = this.sum(paidRows, TransactionType.INCOME);
    const paidExpense = this.sum(paidRows, TransactionType.EXPENSE);
    const cardTotal = monthRows
      .filter((t) => t.paymentMethod === PaymentMethod.CREDIT_CARD && t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + Number(t.valor), 0);
    const saldoInicial = accounts.reduce((acc, account) => acc + Number(account.saldoInicial), 0);
    const totalInvestido = goals.reduce((acc, goal) => acc + Number(goal.valorAtual), 0);
    const gastoHoje = transactions
      .filter((t) => t.data === today && t.type === TransactionType.EXPENSE && t.status !== TransactionStatus.CANCELED)
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const byCategory = Object.values(
      monthRows
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce<Record<string, { name: string; value: number; color: string }>>((acc, item) => {
          const key = item.category?.nome || 'Sem categoria';
          acc[key] ??= { name: key, value: 0, color: item.category?.cor || '#A61E22' };
          acc[key].value += Number(item.valor);
          return acc;
        }, {}),
    );

    const byCard = Object.values(
      monthRows
        .filter((t) => t.paymentMethod === PaymentMethod.CREDIT_CARD)
        .reduce<Record<string, { name: string; value: number }>>((acc, item) => {
          const key = item.card?.nome || 'Sem cartão';
          acc[key] ??= { name: key, value: 0 };
          acc[key].value += Number(item.valor);
          return acc;
        }, {}),
    );

    const monthlyEvolution = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(year, month - 6 + index);
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');
      const rows = transactions.filter((t) => t.data >= start && t.data <= end && t.status !== TransactionStatus.CANCELED);
      return {
        month: format(date, 'MM/yyyy'),
        receitas: this.sum(rows, TransactionType.INCOME),
        despesas: this.sum(rows, TransactionType.EXPENSE),
      };
    });

    const alertas = [
      expenseMonth > incomeMonth ? 'Despesas do mês estão maiores que as receitas.' : null,
      cardTotal > incomeMonth * 0.5 ? 'Cartão representa mais de 50% da receita mensal.' : null,
      gastoHoje > expenseMonth / 10 && expenseMonth > 0 ? 'Gasto de hoje está acima do ritmo mensal.' : null,
    ].filter(Boolean);

    return {
      cards: {
        saldoAtual: saldoInicial + paidIncome - paidExpense,
        receitasMes: incomeMonth,
        despesasMes: expenseMonth,
        gastoHoje,
        totalCartao: cardTotal,
        totalInvestido,
        saldoFinalMes: saldoInicial + incomeMonth - expenseMonth,
        contasPendentes: monthRows.filter((t) => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PENDING).length,
        receitasPrevistas: this.sum(monthRows.filter((t) => t.status === TransactionStatus.PENDING), TransactionType.INCOME),
        despesasPrevistas: this.sum(monthRows.filter((t) => t.status === TransactionStatus.PENDING), TransactionType.EXPENSE),
      },
      monthly: {
        receitasMes: incomeMonth,
        despesasMes: expenseMonth,
        parcelasMes: monthRows.filter((t) => t.isInstallment).length,
        saldoPrevisto: saldoInicial + incomeMonth - expenseMonth,
        saldoRealizado: saldoInicial + paidIncome - paidExpense,
        contasPagas: monthRows.filter((t) => t.type === TransactionType.EXPENSE && t.status === TransactionStatus.PAID).length,
        pendencias: monthRows.filter((t) => t.status === TransactionStatus.PENDING).length,
      },
      charts: {
        byCategory,
        monthlyEvolution,
        incomeVsExpense: monthlyEvolution,
        byCard,
      },
      alertas,
    };
  }

  private sum(rows: Transaction[], type: TransactionType) {
    return rows.filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.valor), 0);
  }
}
