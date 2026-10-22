import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  FORMATO_MES,
  ICONES_META,
  type IconeMeta,
  IDADE_MAXIMA_APOSENTADORIA,
  NOME_MAXIMO,
  TIPOS_META,
  type TipoMeta,
  VALOR_MAXIMO,
} from '../metas';

export class SalvarMetaDto {
  @ApiProperty({
    description:
      'data = meta com valor e data; aposentadoria = renda por mês a partir de uma idade',
    enum: TIPOS_META,
    example: 'data',
  })
  @IsIn(TIPOS_META, { message: 'Tipo de meta inexistente' })
  tipo: TipoMeta;

  @ApiProperty({ description: 'Nome da meta', example: 'Viagem pro Chile' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'nome precisa ser um texto' })
  @IsNotEmpty({ message: 'Dê um nome para a meta' })
  @MaxLength(NOME_MAXIMO, {
    message: `nome pode ter no máximo ${NOME_MAXIMO} caracteres`,
  })
  nome: string;

  @ApiProperty({
    description: 'Ícone da meta (lista fixa do front)',
    enum: ICONES_META,
    example: 'viagem',
  })
  @IsIn(ICONES_META, { message: 'Ícone inexistente' })
  icone: IconeMeta;

  @ApiPropertyOptional({
    description: 'Quanto já tem guardado para a meta, em reais',
    example: 1500,
    default: 0,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'jaTem precisa ser um número com até 2 casas decimais' },
  )
  @Min(0, { message: 'jaTem não pode ser negativo' })
  @Max(VALOR_MAXIMO, { message: 'jaTem muito alto' })
  jaTem?: number;

  @ApiPropertyOptional({
    description: 'Só no tipo data: quanto precisa, em reais de hoje',
    example: 8000,
  })
  @ValidateIf((dto: SalvarMetaDto) => dto.tipo === 'data')
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'valor precisa ser um número com até 2 casas decimais' },
  )
  @Min(1, { message: 'valor precisa ser pelo menos R$ 1' })
  @Max(VALOR_MAXIMO, { message: 'valor muito alto' })
  valor?: number;

  @ApiPropertyOptional({
    description: 'Só no tipo data: até quando, no formato AAAA-MM (no futuro)',
    example: '2027-12',
  })
  @ValidateIf((dto: SalvarMetaDto) => dto.tipo === 'data')
  @Matches(FORMATO_MES, { message: 'Mês inválido. Use o formato AAAA-MM' })
  mes?: string;

  @ApiPropertyOptional({
    description:
      'Só no tipo aposentadoria: renda por mês que quer ter, em reais de hoje',
    example: 5000,
  })
  @ValidateIf((dto: SalvarMetaDto) => dto.tipo === 'aposentadoria')
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'rendaMensal precisa ser um número com até 2 casas decimais' },
  )
  @Min(1, { message: 'rendaMensal precisa ser pelo menos R$ 1' })
  @Max(VALOR_MAXIMO, { message: 'rendaMensal muito alta' })
  rendaMensal?: number;

  @ApiPropertyOptional({
    description:
      'Só no tipo aposentadoria: com quantos anos quer se aposentar (maior que a idade atual)',
    example: 60,
  })
  @ValidateIf((dto: SalvarMetaDto) => dto.tipo === 'aposentadoria')
  @IsInt({ message: 'idadeAposentar precisa ser um número inteiro' })
  @Max(IDADE_MAXIMA_APOSENTADORIA, {
    message: `idadeAposentar pode ser no máximo ${IDADE_MAXIMA_APOSENTADORIA}`,
  })
  idadeAposentar?: number;
}

export class MetaDto {
  @ApiProperty({ example: '3f1c2a9e-7b1d-4c55-9a0e-2a7d5f0c1b11' })
  id: string;

  @ApiProperty({ enum: TIPOS_META, example: 'data' })
  tipo: TipoMeta;

  @ApiProperty({ example: 'Viagem pro Chile' })
  nome: string;

  @ApiProperty({ enum: ICONES_META, example: 'viagem' })
  icone: IconeMeta;

  @ApiProperty({
    description: 'Quanto já tinha quando criou ou editou a meta',
    example: 1500,
  })
  jaTem: number;

  @ApiProperty({
    description:
      'Soma do dinheiro guardado para a meta nos lançamentos da Planilha (categoria metas)',
    example: 446,
  })
  guardado: number;

  @ApiProperty({
    description: 'Tipo data: quanto precisa. Aposentadoria: null',
    example: 8000,
    nullable: true,
    type: Number,
  })
  valor: number | null;

  @ApiProperty({
    description: 'Tipo data: até quando (AAAA-MM). Aposentadoria: null',
    example: '2027-12',
    nullable: true,
    type: String,
  })
  mes: string | null;

  @ApiProperty({
    description: 'Aposentadoria: renda por mês. Tipo data: null',
    example: null,
    nullable: true,
    type: Number,
  })
  rendaMensal: number | null;

  @ApiProperty({
    description: 'Aposentadoria: idade para se aposentar. Tipo data: null',
    example: null,
    nullable: true,
    type: Number,
  })
  idadeAposentar: number | null;

  @ApiProperty({ example: '2026-10-21T12:00:00.000Z' })
  atualizadoEm: Date;
}
