import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, RequisicaoAutenticada } from './auth.model';

export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): JwtPayload =>
    contexto.switchToHttp().getRequest<RequisicaoAutenticada>().usuario,
);
