import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequisicaoAutenticada } from '../auth/auth.model';
import { trilhaPorId } from '../progresso/jornada';
import { ProgressoService } from '../progresso/progresso.service';
import { TRILHA_DA_PLANILHA } from './planilha';

@Injectable()
export class PlanilhaLiberadaGuard implements CanActivate {
  constructor(private readonly progresso: ProgressoService) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const { usuario } = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    const { faseAtual } = await this.progresso.obter(usuario.sub);
    const trilha = trilhaPorId(TRILHA_DA_PLANILHA);

    if (!trilha || faseAtual <= trilha.faseFinal) {
      throw new ForbiddenException(
        `A Planilha de gastos é liberada ao concluir a Trilha ${TRILHA_DA_PLANILHA}`,
      );
    }

    return true;
  }
}
