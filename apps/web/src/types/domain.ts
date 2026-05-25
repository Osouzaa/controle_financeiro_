export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH' | 'TRANSFER' | 'BANK_SLIP';
export type TransactionStatus = 'PENDING' | 'PAID' | 'CANCELED';
export type CategoryType = 'INCOME' | 'EXPENSE';

export type Category = {
  id: string;
  nome: string;
  tipo: CategoryType;
  cor: string;
  icone: string;
};

export type Account = {
  id: string;
  nome: string;
  saldoInicial: string;
  ativo: boolean;
};

export type Card = {
  id: string;
  nome: string;
  limite: string;
  fechamento: number;
  vencimento: number;
  gasto?: number;
  limiteRestante?: number;
  percentualUtilizado?: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  descricao: string;
  valor: string;
  data: string;
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  category?: Category;
  account?: Account;
  card?: Card;
  isInstallment: boolean;
  installmentNumber?: number;
  installmentTotal?: number;
  dueDate?: string;
};

export type Goal = {
  id: string;
  nome: string;
  valorAlvo: string;
  valorAtual: string;
  prazo: string;
};

export type DashboardSummary = {
  cards: Record<
    | 'saldoAtual'
    | 'receitasMes'
    | 'despesasMes'
    | 'gastoHoje'
    | 'totalCartao'
    | 'totalInvestido'
    | 'saldoFinalMes'
    | 'contasPendentes'
    | 'receitasPrevistas'
    | 'despesasPrevistas',
    number
  >;
  monthly: Record<string, number>;
  charts: {
    byCategory: Array<{ name: string; value: number; color?: string }>;
    monthlyEvolution: Array<{ month: string; receitas: number; despesas: number }>;
    incomeVsExpense: Array<{ month: string; receitas: number; despesas: number }>;
    byCard: Array<{ name: string; value: number }>;
  };
  alertas: string[];
};
