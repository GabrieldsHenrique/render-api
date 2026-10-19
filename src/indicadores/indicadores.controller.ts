import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { IndicadoresDto } from './dto/indicadores.dto';
import { IndicadoresService } from './indicadores.service';

@ApiTags('Indicadores')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Sem token ou token inválido/expirado',
})
@UseGuards(JwtGuard)
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadores: IndicadoresService) {}

  @Get()
  @ApiOperation({
    summary: 'Selic, CDI e IPCA esperado',
    description:
      'Responde na hora com o último valor guardado. Se tiver mais de 12h (ou faltar algum), busca no Banco Central em segundo plano para a próxima consulta. Sem nada guardado, espera a primeira busca',
  })
  @ApiOkResponse({ type: IndicadoresDto })
  obter(): Promise<IndicadoresDto> {
    return this.indicadores.obter();
  }
}
