import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.model';
import { JwtGuard } from '../auth/jwt.guard';
import { UsuarioAtual } from '../auth/usuario-atual.decorator';
import { UsuarioDto } from './dto/usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuários')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Sem token, token inválido/expirado ou usuário não existe mais',
})
@UseGuards(JwtGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get('eu')
  @ApiOperation({ summary: 'Dados do usuário logado' })
  @ApiOkResponse({ type: UsuarioDto })
  async eu(@UsuarioAtual() usuarioAtual: JwtPayload): Promise<UsuarioDto> {
    const usuario = await this.usuarios.buscarPorId(usuarioAtual.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return usuario;
  }

  @Post('eu/boas-vindas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marca o modal de boas-vindas como visto',
    description:
      'Pode ser chamada mais de uma vez: se já estava marcado, mantém a data da primeira vez',
  })
  @ApiOkResponse({ type: UsuarioDto })
  async marcarBoasVindasVista(
    @UsuarioAtual() usuarioAtual: JwtPayload,
  ): Promise<UsuarioDto> {
    const usuario = await this.usuarios.marcarBoasVindasVista(usuarioAtual.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return usuario;
  }
}
