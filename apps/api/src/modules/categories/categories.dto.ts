import { IsEnum, IsHexColor, IsOptional, IsString } from 'class-validator';
import { CategoryType } from '../../common/enums';

export class CreateCategoryDto {
  @IsString()
  nome: string;

  @IsEnum(CategoryType)
  tipo: CategoryType;

  @IsOptional()
  @IsHexColor()
  cor?: string;

  @IsOptional()
  @IsString()
  icone?: string;
}
