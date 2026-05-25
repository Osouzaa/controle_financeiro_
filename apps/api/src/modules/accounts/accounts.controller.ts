import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, RequestUser } from '../../auth/auth-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateAccountDto } from './accounts.dto';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Get()
  findAll(@AuthUser() user: RequestUser) {
    return this.service.findAll(user.sub);
  }

  @Post()
  create(@AuthUser() user: RequestUser, @Body() dto: CreateAccountDto) {
    return this.service.create(user.sub, dto);
  }

  @Patch(':id')
  update(@AuthUser() user: RequestUser, @Param('id') id: string, @Body() dto: Partial<CreateAccountDto>) {
    return this.service.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@AuthUser() user: RequestUser, @Param('id') id: string) {
    return this.service.remove(user.sub, id);
  }
}
