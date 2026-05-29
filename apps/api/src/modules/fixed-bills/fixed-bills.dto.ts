import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFixedBillDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsNumberString()
  valor?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class FixedBillChecklistQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;
}

export class ToggleFixedBillPaymentDto extends FixedBillChecklistQueryDto {
  @IsBoolean()
  paid: boolean;
}
