import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { FASE_MAXIMA } from '../jornada';

export class RespostaQuizDto {
  @ApiProperty({
    description: 'Id do card de quiz dentro da fase',
    example: 'mito-renda',
  })
  @IsString({ message: 'Informe o cardId' })
  @IsNotEmpty({ message: 'Informe o cardId' })
  @MaxLength(100, { message: 'cardId muito longo' })
  cardId: string;

  @ApiPropertyOptional({
    description:
      'Fase de onde a pergunta veio, quando é diferente da fase concluída (perguntas erradas refeitas na Revisão da trilha)',
    example: 3,
  })
  @IsOptional()
  @IsInt({ message: 'fase precisa ser um número inteiro' })
  @Min(0, { message: 'Fase inexistente' })
  @Max(FASE_MAXIMA, { message: 'Fase inexistente' })
  fase?: number;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'acertou precisa ser true ou false' })
  acertou: boolean;
}

export class ConcluirFaseDto {
  @ApiProperty({
    type: [RespostaQuizDto],
    description:
      'Respostas dos quizzes da fase (Mito ou verdade e Quiz). Na Revisão da trilha inclui as perguntas erradas refeitas, com a fase de origem. Pode ser vazia',
    example: [
      { cardId: 'mito-renda', acertou: true },
      { cardId: 'quiz-primeiro-passo', acertou: false },
    ],
  })
  @IsArray({ message: 'respostas precisa ser uma lista' })
  @ArrayMaxSize(10, { message: 'Respostas demais para uma fase' })
  @ArrayUnique(
    (resposta: RespostaQuizDto) => `${resposta.fase ?? ''}:${resposta.cardId}`,
    { message: 'Cada pergunta só pode aparecer uma vez' },
  )
  @ValidateNested({ each: true })
  @Type(() => RespostaQuizDto)
  respostas: RespostaQuizDto[];
}
