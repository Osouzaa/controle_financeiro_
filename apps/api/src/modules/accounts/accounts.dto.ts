import { IsBoolean, IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  nome: string;

  @IsNumberString()
  saldoInicial: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
