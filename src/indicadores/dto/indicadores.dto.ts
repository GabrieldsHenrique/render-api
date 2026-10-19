import { ApiProperty } from '@nestjs/swagger';
import { ORIGENS_INDICADOR, type OrigemIndicador } from '../indicadores';

export class IndicadorDto {
  @ApiProperty({ description: 'Taxa em % ao ano', example: 13.75 })
  valor: number;

  @ApiProperty({
    description:
      'De onde veio o valor: banco-central (último valor buscado no BC), estimado (CDI calculado como Selic − 0,10) ou padrao (o BC nunca respondeu)',
    enum: ORIGENS_INDICADOR,
    example: 'banco-central',
  })
  origem: OrigemIndicador;

  @ApiProperty({
    description:
      'Data do valor no Banco Central (AAAA-MM-DD). null quando o valor é padrão',
    example: '2026-09-17',
    type: String,
    nullable: true,
  })
  referencia: string | null;
}

export class IndicadoresDto {
  @ApiProperty({ description: 'Selic meta definida pelo Copom' })
  selic: IndicadorDto;

  @ApiProperty({ description: 'CDI anualizado (base 252)' })
  cdi: IndicadorDto;

  @ApiProperty({
    description: 'IPCA esperado para os próximos 12 meses (mediana do Focus)',
  })
  ipcaEsperado: IndicadorDto;
}
