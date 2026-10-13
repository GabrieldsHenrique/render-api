import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.model';
import { JwtGuard } from '../auth/jwt.guard';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { ConcluirFaseDto } from './dto/concluir-fase.dto';
import { FiltroErrosDto } from './dto/filtro-erros.dto';
import {
  ErroQuizDto,
  ProgressoDto,
  ResultadoConclusaoDto,
} from './dto/progresso.dto';
import { ProgressoService } from './progresso.service';

@ApiTags('Progresso')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Sem token ou token inválido/expirado',
})
@UseGuards(JwtGuard)
@Controller('progresso')
export class ProgressoController {
  constructor(private readonly progresso: ProgressoService) {}

  @Get()
  @ApiOperation({ summary: 'XP e fase atual do usuário logado' })
  @ApiOkResponse({ type: ProgressoDto })
  obter(@UsuarioAtual() usuario: JwtPayload): Promise<ProgressoDto> {
    return this.progresso.obter(usuario.sub);
  }

  @Post('fases/:fase/concluir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Conclui uma fase e salva as respostas dos quizzes',
    description:
      'Fase atual: grava e dá XP (30, ou 50 na revisão). Fase já concluída: só atualiza as respostas, sem XP. Fase futura: 403',
  })
  @ApiOkResponse({ type: ResultadoConclusaoDto })
  @ApiBadRequestResponse({
    description: 'Fase inexistente ou respostas inválidas',
  })
  @ApiForbiddenResponse({ description: 'Fase bloqueada' })
  @ApiConflictResponse({
    description: 'Fase concluída ao mesmo tempo em outra requisição',
  })
  concluirFase(
    @UsuarioAtual() usuario: JwtPayload,
    @Param(
      'fase',
      new ParseIntPipe({
        exceptionFactory: () => new BadRequestException('Fase inexistente'),
      }),
    )
    fase: number,
    @Body() dto: ConcluirFaseDto,
  ): Promise<ResultadoConclusaoDto> {
    return this.progresso.concluirFase(usuario.sub, fase, dto.respostas);
  }

  @Get('erros')
  @ApiOperation({
    summary: 'Perguntas que o usuário errou (pontos para reforçar)',
    description:
      'Sem filtro: todas. ?fase=3 para o fim de cada fase, ?trilha=1 para a Revisão da trilha',
  })
  @ApiOkResponse({ type: [ErroQuizDto] })
  @ApiBadRequestResponse({ description: 'Filtro inválido' })
  listarErros(
    @UsuarioAtual() usuario: JwtPayload,
    @Query() filtro: FiltroErrosDto,
  ): Promise<ErroQuizDto[]> {
    return this.progresso.listarErros(usuario.sub, filtro);
  }
}
