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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.model';
import { JwtGuard } from '../auth/jwt.guard';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { MetaDto, SalvarMetaDto } from './dto/meta.dto';
import { MetasLiberadasGuard } from './metas-liberadas.guard';
import { MetasService } from './metas.service';

const idValido = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('Id inválido'),
});

@ApiTags('Planejador de metas')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Sem token ou token inválido/expirado',
})
@ApiForbiddenResponse({
  description: 'Planejador bloqueado: a Trilha 5 ainda não foi concluída',
})
@UseGuards(JwtGuard, MetasLiberadasGuard)
@Controller('metas')
export class MetasController {
  constructor(private readonly metas: MetasService) {}

  @Get()
  @ApiOperation({ summary: 'Suas metas', description: 'Na ordem de criação' })
  @ApiOkResponse({ type: [MetaDto] })
  listar(@UsuarioAtual() usuario: JwtPayload): Promise<MetaDto[]> {
    return this.metas.listar(usuario.sub);
  }

  @Post()
  @ApiOperation({
    summary: 'Cria uma meta',
    description:
      'Tipo data pede valor e mes; aposentadoria pede rendaMensal e idadeAposentar (só uma por pessoa)',
  })
  @ApiCreatedResponse({ type: MetaDto })
  @ApiBadRequestResponse({
    description:
      'Campo inválido, data no passado, idade menor que a atual ou limite de metas atingido',
  })
  @ApiConflictResponse({ description: 'Já existe uma meta de aposentadoria' })
  criar(
    @UsuarioAtual() usuario: JwtPayload,
    @Body() dto: SalvarMetaDto,
  ): Promise<MetaDto> {
    return this.metas.criar(usuario.sub, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualiza uma meta',
    description: 'Substitui a meta inteira (mesmo corpo da criação)',
  })
  @ApiOkResponse({ type: MetaDto })
  @ApiBadRequestResponse({
    description:
      'Id ou campo inválido, data no passado ou idade menor que a atual',
  })
  @ApiNotFoundResponse({ description: 'Meta não existe ou é de outra pessoa' })
  @ApiConflictResponse({ description: 'Já existe uma meta de aposentadoria' })
  atualizar(
    @UsuarioAtual() usuario: JwtPayload,
    @Param('id', idValido) id: string,
    @Body() dto: SalvarMetaDto,
  ): Promise<MetaDto> {
    return this.metas.atualizar(usuario.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma meta' })
  @ApiNoContentResponse({ description: 'Removida' })
  @ApiBadRequestResponse({ description: 'Id em formato inválido' })
  @ApiNotFoundResponse({ description: 'Meta não existe ou é de outra pessoa' })
  remover(
    @UsuarioAtual() usuario: JwtPayload,
    @Param('id', idValido) id: string,
  ): Promise<void> {
    return this.metas.remover(usuario.sub, id);
  }
}
