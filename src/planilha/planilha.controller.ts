import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.model';
import { JwtGuard } from '../auth/jwt.guard';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import {
  CriarLancamentoDto,
  FiltroLancamentosDto,
  LancamentoDto,
} from './dto/lancamento.dto';
import { MesDto, OrcamentoDto, SalvarOrcamentoDto } from './dto/orcamento.dto';
import { PlanilhaLiberadaGuard } from './planilha-liberada.guard';
import { PlanilhaService } from './planilha.service';

@ApiTags('Planilha de gastos')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Sem token ou token inválido/expirado',
})
@ApiForbiddenResponse({
  description: 'Planilha bloqueada: a Trilha 1 ainda não foi concluída',
})
@UseGuards(JwtGuard, PlanilhaLiberadaGuard)
@Controller('planilha')
export class PlanilhaController {
  constructor(private readonly planilha: PlanilhaService) {}

  @Get('orcamentos/:mes')
  @ApiOperation({
    summary: 'Orçamento do mês',
    description:
      'Mês sem orçamento salvo devolve renda 0, nenhuma categoria e atualizadoEm null',
  })
  @ApiOkResponse({ type: OrcamentoDto })
  @ApiBadRequestResponse({ description: 'Mês em formato inválido' })
  obterOrcamento(
    @UsuarioAtual() usuario: JwtPayload,
    @Param() { mes }: MesDto,
  ): Promise<OrcamentoDto> {
    return this.planilha.obterOrcamento(usuario.sub, mes);
  }

  @Put('orcamentos/:mes')
  @ApiOperation({
    summary: 'Salva o orçamento do mês',
    description:
      'Cria ou substitui o orçamento inteiro (renda + valor de cada categoria). Mandar duas vezes dá o mesmo resultado',
  })
  @ApiOkResponse({ type: OrcamentoDto })
  @ApiBadRequestResponse({
    description: 'Mês inválido, categoria inexistente ou valor inválido',
  })
  @ApiConflictResponse({
    description: 'Orçamento salvo ao mesmo tempo em outra requisição',
  })
  salvarOrcamento(
    @UsuarioAtual() usuario: JwtPayload,
    @Param() { mes }: MesDto,
    @Body() dto: SalvarOrcamentoDto,
  ): Promise<OrcamentoDto> {
    return this.planilha.salvarOrcamento(usuario.sub, mes, dto);
  }

  @Get('lancamentos')
  @ApiOperation({
    summary: 'Gastos do mês',
    description:
      'Inclui as parcelas que caem no mês de compras feitas em meses anteriores (parcela e valor calculados)',
  })
  @ApiOkResponse({ type: [LancamentoDto] })
  @ApiBadRequestResponse({ description: 'Mês em formato inválido' })
  listarLancamentos(
    @UsuarioAtual() usuario: JwtPayload,
    @Query() { mes }: FiltroLancamentosDto,
  ): Promise<LancamentoDto[]> {
    return this.planilha.listarLancamentos(usuario.sub, mes);
  }

  @Post('lancamentos')
  @ApiOperation({
    summary: 'Anota um gasto',
    description:
      'Parcelado: mande o valor total e a quantidade de parcelas — a parcela de cada mês é calculada',
  })
  @ApiCreatedResponse({ type: LancamentoDto })
  @ApiBadRequestResponse({
    description: 'Categoria inexistente, valor inválido ou data no futuro',
  })
  criarLancamento(
    @UsuarioAtual() usuario: JwtPayload,
    @Body() dto: CriarLancamentoDto,
  ): Promise<LancamentoDto> {
    return this.planilha.criarLancamento(usuario.sub, dto);
  }

  @Delete('lancamentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um gasto',
    description: 'Compra parcelada: remove todas as parcelas',
  })
  @ApiNoContentResponse({ description: 'Removido' })
  @ApiBadRequestResponse({ description: 'Id em formato inválido' })
  @ApiNotFoundResponse({
    description: 'Lançamento não existe ou é de outra pessoa',
  })
  removerLancamento(
    @UsuarioAtual() usuario: JwtPayload,
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Id inválido'),
      }),
    )
    id: string,
  ): Promise<void> {
    return this.planilha.removerLancamento(usuario.sub, id);
  }
}
