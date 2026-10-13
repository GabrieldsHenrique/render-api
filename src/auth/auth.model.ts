import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RequisicaoAutenticada extends Request {
  usuario: JwtPayload;
}
