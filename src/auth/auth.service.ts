import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, hashSync } from 'bcryptjs';
import { UsuarioDto } from '../usuarios/dto/usuario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtPayload } from './auth.model';
import { RespostaLoginDto } from './dto/resposta-login.dto';
import { CadastroDto } from './dto/cadastro.dto';
import { LoginDto } from './dto/login.dto';

const CUSTO_HASH = 10;

const HASH_FALSO = hashSync('usuario-inexistente', CUSTO_HASH);

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async cadastrar(dto: CadastroDto): Promise<UsuarioDto> {
    const senhaHash = await hash(dto.senha, CUSTO_HASH);

    return this.usuarios.criar({
      nome: dto.nome,
      email: dto.email,
      dataNascimento: new Date(dto.dataNascimento),
      senhaHash,
      termosAceitosEm: new Date(),
    });
  }

  async login(dto: LoginDto): Promise<RespostaLoginDto> {
    const usuario = await this.usuarios.buscarPorEmail(dto.email);

    const senhaCorreta = await compare(
      dto.senha,
      usuario?.senhaHash ?? HASH_FALSO,
    );

    if (!usuario || !senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email };

    return {
      accessToken: await this.jwt.signAsync(payload),
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    };
  }
}
