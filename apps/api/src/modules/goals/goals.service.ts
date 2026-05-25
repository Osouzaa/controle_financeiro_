import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../../database/entities';
import { CreateGoalDto } from './goals.dto';

@Injectable()
export class GoalsService {
  constructor(@InjectRepository(Goal) private readonly repo: Repository<Goal>) {}

  findAll(userId: string) {
    return this.repo.find({ where: { userId }, order: { prazo: 'ASC' } });
  }

  create(userId: string, dto: CreateGoalDto) {
    return this.repo.save({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: Partial<CreateGoalDto>) {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Meta não encontrada.');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Meta nao encontrada.');
    return { ok: true };
  }
}
