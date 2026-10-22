import { ApiProperty } from '@nestjs/swagger';

export class ProgressoDto {
  @ApiProperty({
    description: 'Soma do XP de todas as fases concluídas',
    example: 90,
  })
  xp: number;

  @ApiProperty({
    description:
      'Fase em andamento (= quantidade de fases concluídas). 100 quando a jornada termina (fases de 0 a 99) — e sempre 100 para admin, que tem tudo liberado',
    example: 3,
  })
  faseAtual: number;
}

export class ResultadoConclusaoDto extends ProgressoDto {
  @ApiProperty({
    description:
      'XP ganho agora: 30, 50 na revisão da trilha ou 0 ao refazer uma fase',
    example: 30,
  })
  xpGanho: number;
}

export class ErroQuizDto {
  @ApiProperty({ example: 0 })
  fase: number;

  @ApiProperty({ example: 'quiz-primeiro-passo' })
  cardId: string;

  @ApiProperty({ description: 'Quando a pessoa respondeu (a última vez)' })
  respondidaEm: Date;
}
