import { IsDateString, IsNumberString, IsString } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  nome: string;

  @IsNumberString()
  valorAlvo: string;

  @IsNumberString()
  valorAtual: string;

  @IsDateString()
  prazo: string;
}
