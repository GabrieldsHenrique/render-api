import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsuarioDto } from '../usuarios/dto/usuario.dto';
import { AuthService } from './auth.service';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';
import { RespostaLoginDto } from './dto/resposta-login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cadastro')
  @ApiOperation({ summary: 'Cria uma conta' })
  @ApiCreatedResponse({ type: UsuarioDto, description: 'Conta criada' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos (lista de mensagens em `message`)',
  })
  @ApiConflictResponse({ description: 'Este e-mail já está cadastrado' })
  cadastrar(@Body() dto: CadastroDto): Promise<UsuarioDto> {
    return this.authService.cadastrar(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Entra com e-mail e senha e recebe o token' })
  @ApiOkResponse({ type: RespostaLoginDto, description: 'Login feito' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos' })
  login(@Body() dto: LoginDto): Promise<RespostaLoginDto> {
    return this.authService.login(dto);
  }
}
