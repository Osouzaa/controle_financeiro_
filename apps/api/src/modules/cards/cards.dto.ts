import { IsInt, IsNumberString, IsString, Max, Min } from 'class-validator';

export class CreateCardDto {
  @IsString()
  nome: string;

  @IsNumberString()
  limite: string;

  @IsInt()
  @Min(1)
  @Max(31)
  vencimento: number;
}
