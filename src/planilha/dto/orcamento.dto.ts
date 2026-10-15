import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNumber,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CATEGORIAS_ORCAMENTO,
  type CategoriaOrcamento,
  FORMATO_MES,
  VALOR_MAXIMO,
} from '../planilha';

export class MesDto {
  @ApiProperty({ description: 'Mês no formato AAAA-MM', example: '2026-10' })
  @Matches(FORMATO_MES, { message: 'Mês inválido. Use o formato AAAA-MM' })
  mes: string;
}

export class ValorCategoriaDto {
  @ApiProperty({
    description: 'Id da categoria (lista fixa do front)',
    enum: CATEGORIAS_ORCAMENTO,
    example: 'moradia',
  })
  @IsIn(CATEGORIAS_ORCAMENTO, { message: 'Categoria inexistente' })
  categoria: CategoriaOrcamento;

  @ApiProperty({ description: 'Valor planejado em reais', example: 900 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'valor precisa ser um número com até 2 casas decimais' },
  )
  @Min(0, { message: 'valor não pode ser negativo' })
  @Max(VALOR_MAXIMO, { message: 'valor muito alto' })
  valor: number;
}

export class SalvarOrcamentoDto {
  @ApiProperty({ description: 'Renda do mês em reais', example: 3200 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'renda precisa ser um número com até 2 casas decimais' },
  )
  @Min(0, { message: 'renda não pode ser negativa' })
  @Max(VALOR_MAXIMO, { message: 'renda muito alta' })
  renda: number;

  @ApiProperty({
    type: [ValorCategoriaDto],
    description:
      'Valor planejado de cada categoria. Substitui o que estava salvo; categoria fora da lista ou com 0 fica sem valor',
    example: [
      { categoria: 'moradia', valor: 900 },
      { categoria: 'lazer', valor: 250 },
    ],
  })
  @IsArray({ message: 'categorias precisa ser uma lista' })
  @ArrayMaxSize(CATEGORIAS_ORCAMENTO.length, {
    message: 'Categorias demais',
  })
  @ArrayUnique((item: ValorCategoriaDto) => item.categoria, {
    message: 'Cada categoria só pode aparecer uma vez',
  })
  @ValidateNested({ each: true })
  @Type(() => ValorCategoriaDto)
  categorias: ValorCategoriaDto[];
}

export class OrcamentoDto {
  @ApiProperty({ example: '2026-10' })
  mes: string;

  @ApiProperty({ example: 3200 })
  renda: number;

  @ApiProperty({
    type: [ValorCategoriaDto],
    description: 'Só as categorias com valor planejado',
  })
  categorias: ValorCategoriaDto[];

  @ApiProperty({
    description:
      'Última vez que o orçamento foi salvo. null = mês ainda sem orçamento',
    nullable: true,
    type: Date,
  })
  atualizadoEm: Date | null;
}
