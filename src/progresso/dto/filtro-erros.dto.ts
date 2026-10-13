import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { FASE_MAXIMA, TRILHAS } from '../jornada';

export class FiltroErrosDto {
  @ApiPropertyOptional({
    description: 'Só os erros desta fase (fim de cada fase)',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'fase precisa ser um número inteiro' })
  @Min(0, { message: 'Fase inexistente' })
  @Max(FASE_MAXIMA, { message: 'Fase inexistente' })
  fase?: number;

  @ApiPropertyOptional({
    description: 'Só os erros desta trilha (Revisão da trilha)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'trilha precisa ser um número inteiro' })
  @Min(1, { message: 'Trilha inexistente' })
  @Max(TRILHAS.length, { message: 'Trilha inexistente' })
  trilha?: number;
}
