import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, RequisicaoAutenticada } from './auth.model';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const requisicao = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    const [tipo, token] = requisicao.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Faça login para continuar');
    }

    try {
      requisicao.usuario = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException(
        'Sessão inválida ou expirada. Faça login novamente',
      );
    }

    return true;
  }
}
