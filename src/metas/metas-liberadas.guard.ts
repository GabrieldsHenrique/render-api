import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequisicaoAutenticada } from '../auth/auth.model';
import { trilhaPorId } from '../progresso/jornada';
import { ProgressoService } from '../progresso/progresso.service';
import { TRILHA_DO_PLANEJADOR } from './metas';

@Injectable()
export class MetasLiberadasGuard implements CanActivate {
  constructor(private readonly progresso: ProgressoService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const { usuario } = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    const { faseAtual } = await this.progresso.obter(usuario.sub);
    const trilha = trilhaPorId(TRILHA_DO_PLANEJADOR);

    if (!trilha || faseAtual <= trilha.faseFinal) {
      throw new ForbiddenException(
        `O Planejador de metas é liberado ao concluir a Trilha ${TRILHA_DO_PLANEJADOR}`,
      );
    }

    return true;
  }
}
