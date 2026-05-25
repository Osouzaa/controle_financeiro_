import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities';
import { CreateCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  findAll(userId: string) {
    return this.repo.find({ where: { userId }, order: { nome: 'ASC' } });
  }

  create(userId: string, dto: CreateCategoryDto) {
    return this.repo.save({ ...dto, userId });
  }

  async update(userId: string, id: string, dto: Partial<CreateCategoryDto>) {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Categoria não encontrada.');
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.repo.delete({ id, userId });
    if (!result.affected) throw new NotFoundException('Categoria não encontrada.');
    return { ok: true };
  }
}
