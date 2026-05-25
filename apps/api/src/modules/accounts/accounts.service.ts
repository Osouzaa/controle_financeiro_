import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../database/entities';
import { CreateAccountDto } from './accounts.dto';

@Injectable()
export class AccountsService {
  constructor(@InjectRepository(Account) private readonly repo: Repository<Account>) {}

  findAll(userId: string) {
    return this.repo.find({ where: { userId }, order: { nome: 'ASC' } });
  }

  create(userId: string, dto: CreateAccountDto) {
    return this.repo.save({ ...dto, ativo: dto.ativo ?? true, userId });
  }

  async update(userId: string, id: string, dto: Partial<CreateAccountDto>) {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Conta não encontrada.');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Conta não encontrada.');
    return { ok: true };
  }
}
