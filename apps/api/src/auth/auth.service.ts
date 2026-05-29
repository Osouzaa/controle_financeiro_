import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CategoryType } from '../common/enums';
import { Account, Category, User } from '../database/entities';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('Este e-mail já está cadastrado.');

    const user = await this.users.save({
      nome: dto.nome.trim(),
      email,
      senha: await bcrypt.hash(dto.senha, 10),
    });

    await this.seedDefaults(user.id);
    return this.issueTokens(user.id, user.email, user.nome);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(dto.senha, user.senha))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    return this.issueTokens(user.id, user.email, user.nome);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      });
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
        throw new UnauthorizedException();
      }
      return this.issueTokens(user.id, user.email, user.nome);
    } catch {
      throw new UnauthorizedException('Refresh token inválido.');
    }
  }

  async logout(userId: string) {
    await this.users.update(userId, { refreshTokenHash: undefined });
    return { ok: true };
  }

  private async issueTokens(userId: string, email: string, nome: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      expiresIn: '30d',
    });
    await this.users.update(userId, { refreshTokenHash: await bcrypt.hash(refreshToken, 10) });
    return { accessToken, refreshToken, user: { id: userId, nome, email } };
  }

  private async seedDefaults(userId: string) {
    const categoryRows = [
      ['Salário', CategoryType.INCOME, '#22C55E', 'Work'],
      ['PJ', CategoryType.INCOME, '#16A34A', 'Business'],
      ['Freela', CategoryType.INCOME, '#0EA5E9', 'Laptop'],
      ['Bônus', CategoryType.INCOME, '#84CC16', 'Stars'],
      ['Reembolso', CategoryType.INCOME, '#14B8A6', 'Replay'],
      ['Casa', CategoryType.EXPENSE, '#0F766E', 'Home'],
      ['Mercado', CategoryType.EXPENSE, '#14B8A6', 'ShoppingCart'],
      ['Combustível', CategoryType.EXPENSE, '#D97706', 'LocalGasStation'],
      ['Água', CategoryType.EXPENSE, '#0EA5E9', 'WaterDrop'],
      ['Luz', CategoryType.EXPENSE, '#EAB308', 'Bolt'],
      ['Faculdade', CategoryType.EXPENSE, '#7C3AED', 'School'],
      ['Cursos', CategoryType.EXPENSE, '#2563EB', 'MenuBook'],
      ['Ferramentas', CategoryType.EXPENSE, '#475569', 'Build'],
      ['iFood', CategoryType.EXPENSE, '#F59E0B', 'Restaurant'],
      ['Lazer', CategoryType.EXPENSE, '#EC4899', 'Celebration'],
      ['Compras', CategoryType.EXPENSE, '#1D4ED8', 'ShoppingBag'],
    ] as const;

    await this.categories.save(
      categoryRows.map(([nome, tipo, cor, icone]) => ({ nome, tipo, cor, icone, userId })),
    );
    await this.accounts.save([
      { nome: 'Nubank', saldoInicial: '0', ativo: true, userId },
      { nome: 'Carteira', saldoInicial: '0', ativo: true, userId },
    ]);
  }
}
