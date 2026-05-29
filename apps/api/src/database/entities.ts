import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryType, PaymentMethod, TransactionStatus, TransactionType } from '../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @Column({ nullable: true })
  refreshTokenHash?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'enum', enum: CategoryType })
  tipo: CategoryType;

  @Column({ default: '#0F766E' })
  cor: string;

  @Column({ default: 'Category' })
  icone: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  saldoInicial: string;

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('decimal', { precision: 14, scale: 2 })
  limite: string;

  @Column()
  vencimento: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  descricao: string;

  @Column('decimal', { precision: 14, scale: 2 })
  valor: string;

  @Column({ type: 'date' })
  data: string;

  @Column({ type: 'text', nullable: true })
  observacao?: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod?: PaymentMethod;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Account, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account?: Account;

  @Column({ nullable: true })
  accountId?: string;

  @ManyToOne(() => Card, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cardId' })
  card?: Card;

  @Column({ nullable: true })
  cardId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ default: false })
  isInstallment: boolean;

  @Column({ nullable: true })
  installmentGroupId?: string;

  @Column({ nullable: true })
  installmentNumber?: number;

  @Column({ nullable: true })
  installmentTotal?: number;

  @Column('decimal', { precision: 14, scale: 2, nullable: true })
  totalAmount?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('decimal', { precision: 14, scale: 2 })
  valorAlvo: string;

  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  valorAtual: string;

  @Column({ type: 'date' })
  prazo: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}

@Entity('fixed_bills')
export class FixedBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('decimal', { precision: 14, scale: 2, nullable: true })
  valor?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => FixedBillPayment, (payment) => payment.fixedBill)
  payments: FixedBillPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('fixed_bill_payments')
export class FixedBillPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FixedBill, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fixedBillId' })
  fixedBill: FixedBill;

  @Column()
  fixedBillId: string;

  @Column()
  userId: string;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ default: false })
  paid: boolean;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transactionId' })
  transaction?: Transaction;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export const entities = [User, Category, Account, Card, Transaction, Goal, FixedBill, FixedBillPayment];
