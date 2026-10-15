import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CATEGORIAS_ORCAMENTO,
  type CategoriaOrcamento,
  DESCRICAO_MAXIMA,
  FORMATO_DATA,
  FORMATO_MES,
  PARCELAS_MAXIMAS,
  VALOR_MAXIMO,
} from '../planilha';

export class FiltroLancamentosDto {
  @ApiProperty({ description: 'Mês no formato AAAA-MM', example: '2026-10' })
  @Matches(FORMATO_MES, { message: 'Mês inválido. Use o formato AAAA-MM' })
  mes: string;
}

export class CriarLancamentoDto {
  @ApiProperty({
    description: 'Id da categoria (lista fixa do front)',
    enum: CATEGORIAS_ORCAMENTO,
    example: 'compras',
  })
  @IsIn(CATEGORIAS_ORCAMENTO, { message: 'Categoria inexistente' })
  categoria: CategoriaOrcamento;

  @ApiProperty({
    description:
      'Valor total da compra em reais (parcelada: o total, não a parcela)',
    example: 5000,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'valorTotal precisa ser um número com até 2 casas decimais' },
  )
  @Min(0.01, { message: 'valorTotal precisa ser maior que zero' })
  @Max(VALOR_MAXIMO, { message: 'valorTotal muito alto' })
  valorTotal: number;

  @ApiPropertyOptional({
    description: 'Quantidade de parcelas (1 = à vista)',
    example: 10,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'parcelas precisa ser um número inteiro' })
  @Min(1, { message: 'parcelas precisa ser pelo menos 1' })
  @Max(PARCELAS_MAXIMAS, {
    message: `parcelas pode ser no máximo ${PARCELAS_MAXIMAS}`,
  })
  parcelas?: number;

  @ApiProperty({
    description: 'Dia da compra no formato AAAA-MM-DD (não pode ser no futuro)',
    example: '2026-10-14',
  })
  @Matches(FORMATO_DATA, { message: 'Data inválida. Use o formato AAAA-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'Data inexistente' })
  data: string;

  @ApiPropertyOptional({ description: 'Descrição livre', example: 'Notebook' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'descricao precisa ser um texto' })
  @MaxLength(DESCRICAO_MAXIMA, {
    message: `descricao pode ter no máximo ${DESCRICAO_MAXIMA} caracteres`,
  })
  descricao?: string;
}

export class LancamentoDto {
  @ApiProperty({ example: '3f1c2a9e-7b1d-4c55-9a0e-2a7d5f0c1b11' })
  id: string;

  @ApiProperty({ enum: CATEGORIAS_ORCAMENTO, example: 'compras' })
  categoria: CategoriaOrcamento;

  @ApiProperty({ example: 'Notebook' })
  descricao: string;

  @ApiProperty({ description: 'Dia da compra', example: '2026-10-14' })
  data: string;

  @ApiProperty({ description: 'Valor total da compra', example: 5000 })
  valorTotal: number;

  @ApiProperty({ example: 10 })
  parcelas: number;

  @ApiProperty({
    description: 'Qual parcela cai no mês consultado (1 a parcelas)',
    example: 2,
  })
  parcela: number;

  @ApiProperty({
    description:
      'Valor que cai no mês consultado (a parcela; a última leva os centavos que sobram)',
    example: 500,
  })
  valor: number;
}
