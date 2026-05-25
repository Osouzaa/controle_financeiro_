import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async me(id: string) {
    const user = await this.repo.findOneOrFail({ where: { id } });
    return { id: user.id, nome: user.nome, email: user.email, createdAt: user.createdAt };
  }
}
