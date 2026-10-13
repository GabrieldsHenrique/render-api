import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RespostaQuizDto } from './dto/concluir-fase.dto';
import { FiltroErrosDto } from './dto/filtro-erros.dto';
import {
  ErroQuizDto,
  ProgressoDto,
  ResultadoConclusaoDto,
} from './dto/progresso.dto';
import { FASE_MAXIMA, trilhaDaFase, trilhaPorId, xpDaFase } from './jornada';

@Injectable()
export class ProgressoService {
  constructor(private readonly prisma: PrismaService) {}

  obter(usuarioId: string): Promise<ProgressoDto> {
    return this.calcular(this.prisma, usuarioId);
  }

  async concluirFase(
    usuarioId: string,
    fase: number,
    respostas: RespostaQuizDto[],
  ): Promise<ResultadoConclusaoDto> {
    if (fase < 0 || fase > FASE_MAXIMA) {
      throw new BadRequestException('Fase inexistente');
    }

    const trilha = trilhaDaFase(fase);
    const respostasValidas = respostas.map((resposta) => ({
      ...resposta,
      fase: resposta.fase ?? fase,
    }));
    const foraDaRevisao = respostasValidas.some(
      (resposta) =>
        resposta.fase !== fase &&
        (trilha?.faseFinal !== fase ||
          resposta.fase < trilha.faseInicial ||
          resposta.fase > fase),
    );
    if (foraDaRevisao) {
      throw new BadRequestException(
        'Só a Revisão da trilha pode responder perguntas de outras fases da mesma trilha',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const { faseAtual } = await this.calcular(tx, usuarioId);

        if (fase > faseAtual) {
          throw new ForbiddenException(
            'Fase bloqueada. Conclua as fases anteriores primeiro',
          );
        }

        let xpGanho = 0;
        if (fase === faseAtual) {
          xpGanho = xpDaFase(fase);
          await tx.faseConcluida.create({
            data: { usuarioId, fase, xpGanho },
          });
        }

        for (const {
          fase: faseResposta,
          cardId,
          acertou,
        } of respostasValidas) {
          await tx.respostaQuiz.upsert({
            where: {
              usuarioId_fase_cardId: { usuarioId, fase: faseResposta, cardId },
            },
            create: { usuarioId, fase: faseResposta, cardId, acertou },
            update: { acertou },
          });
        }

        const { xp, faseAtual: novaFaseAtual } = await this.calcular(
          tx,
          usuarioId,
        );
        return { xpGanho, xp, faseAtual: novaFaseAtual };
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException('Esta fase já foi concluída');
      }
      throw erro;
    }
  }

  async listarErros(
    usuarioId: string,
    filtro: FiltroErrosDto,
  ): Promise<ErroQuizDto[]> {
    const where: Prisma.RespostaQuizWhereInput = { usuarioId, acertou: false };

    if (filtro.trilha !== undefined) {
      const trilha = trilhaPorId(filtro.trilha);
      where.fase = { gte: trilha?.faseInicial, lte: trilha?.faseFinal };
    }
    if (filtro.fase !== undefined) {
      where.AND = { fase: filtro.fase };
    }

    return this.prisma.respostaQuiz.findMany({
      where,
      select: { fase: true, cardId: true, respondidaEm: true },
      orderBy: [{ fase: 'asc' }, { respondidaEm: 'asc' }],
    });
  }

  private async calcular(
    db: Prisma.TransactionClient,
    usuarioId: string,
  ): Promise<ProgressoDto> {
    const resumo = await db.faseConcluida.aggregate({
      where: { usuarioId },
      _sum: { xpGanho: true },
      _count: true,
    });

    return { xp: resumo._sum.xpGanho ?? 0, faseAtual: resumo._count };
  }
}
