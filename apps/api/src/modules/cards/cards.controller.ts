import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, RequestUser } from '../../auth/auth-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateCardDto } from './cards.dto';
import { CardsService } from './cards.service';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Get()
  findAll(@AuthUser() user: RequestUser) {
    return this.service.findAll(user.sub);
  }

  @Post()
  create(@AuthUser() user: RequestUser, @Body() dto: CreateCardDto) {
    return this.service.create(user.sub, dto);
  }

  @Patch(':id')
  update(@AuthUser() user: RequestUser, @Param('id') id: string, @Body() dto: Partial<CreateCardDto>) {
    return this.service.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.sub, id);
  }
}
