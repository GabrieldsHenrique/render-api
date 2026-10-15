import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lancamento, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarLancamentoDto, LancamentoDto } from './dto/lancamento.dto';
import { OrcamentoDto, SalvarOrcamentoDto } from './dto/orcamento.dto';
import {
  CategoriaOrcamento,
  hoje,
  inicioDoMes,
  mesesEntre,
  PARCELAS_MAXIMAS,
  paraData,
  paraTexto,
  valorDaParcela,
} from './planilha';

const COM_CATEGORIAS = {
  categorias: { orderBy: { categoria: 'asc' } },
} as const;

type OrcamentoComCategorias = Prisma.OrcamentoGetPayload<{
  include: typeof COM_CATEGORIAS;
}>;

@Injectable()
export class PlanilhaService {
  constructor(private readonly prisma: PrismaService) {}

  async obterOrcamento(usuarioId: string, mes: string): Promise<OrcamentoDto> {
    const orcamento = await this.prisma.orcamento.findUnique({
      where: { usuarioId_mes: { usuarioId, mes } },
      include: COM_CATEGORIAS,
    });

    if (!orcamento) {
      return { mes, renda: 0, categorias: [], atualizadoEm: null };
    }
    return this.paraDto(orcamento);
  }

  async salvarOrcamento(
    usuarioId: string,
    mes: string,
    dto: SalvarOrcamentoDto,
  ): Promise<OrcamentoDto> {
    const categorias = dto.categorias.filter((item) => item.valor > 0);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const { id } = await tx.orcamento.upsert({
          where: { usuarioId_mes: { usuarioId, mes } },
          create: { usuarioId, mes, renda: dto.renda },
          update: { renda: dto.renda },
        });

        await tx.orcamentoCategoria.deleteMany({ where: { orcamentoId: id } });
        await tx.orcamentoCategoria.createMany({
          data: categorias.map(({ categoria, valor }) => ({
            orcamentoId: id,
            categoria,
            valor,
          })),
        });

        const salvo = await tx.orcamento.findUniqueOrThrow({
          where: { id },
          include: COM_CATEGORIAS,
        });
        return this.paraDto(salvo);
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException(
          'O orçamento deste mês foi salvo ao mesmo tempo em outra requisição. Tente de novo',
        );
      }
      throw erro;
    }
  }

  async listarLancamentos(
    usuarioId: string,
    mes: string,
  ): Promise<LancamentoDto[]> {
    const lancamentos = await this.prisma.lancamento.findMany({
      where: {
        usuarioId,
        data: {
          gte: inicioDoMes(mes, -(PARCELAS_MAXIMAS - 1)),
          lt: inicioDoMes(mes, 1),
        },
      },
      orderBy: [{ data: 'desc' }, { criadoEm: 'desc' }],
    });

    return lancamentos
      .map((lancamento) =>
        this.lancamentoParaDto(
          lancamento,
          mesesEntre(lancamento.data, mes) + 1,
        ),
      )
      .filter((lancamento) => lancamento.parcela <= lancamento.parcelas);
  }

  async criarLancamento(
    usuarioId: string,
    dto: CriarLancamentoDto,
  ): Promise<LancamentoDto> {
    if (dto.data > hoje()) {
      throw new BadRequestException('A data do gasto não pode ser no futuro');
    }

    const lancamento = await this.prisma.lancamento.create({
      data: {
        usuarioId,
        categoria: dto.categoria,
        descricao: dto.descricao ?? '',
        valorTotal: dto.valorTotal,
        parcelas: dto.parcelas ?? 1,
        data: paraData(dto.data),
      },
    });
    return this.lancamentoParaDto(lancamento, 1);
  }

  async removerLancamento(usuarioId: string, id: string): Promise<void> {
    const { count } = await this.prisma.lancamento.deleteMany({
      where: { id, usuarioId },
    });

    if (count === 0) {
      throw new NotFoundException('Lançamento não encontrado');
    }
  }

  private lancamentoParaDto(
    lancamento: Lancamento,
    parcela: number,
  ): LancamentoDto {
    const valorTotal = lancamento.valorTotal.toNumber();
    return {
      id: lancamento.id,
      categoria: lancamento.categoria as CategoriaOrcamento,
      descricao: lancamento.descricao,
      data: paraTexto(lancamento.data),
      valorTotal,
      parcelas: lancamento.parcelas,
      parcela,
      valor: valorDaParcela(valorTotal, lancamento.parcelas, parcela),
    };
  }

  private paraDto(orcamento: OrcamentoComCategorias): OrcamentoDto {
    return {
      mes: orcamento.mes,
      renda: orcamento.renda.toNumber(),
      categorias: orcamento.categorias.map(({ categoria, valor }) => ({
        categoria: categoria as CategoriaOrcamento,
        valor: valor.toNumber(),
      })),
      atualizadoEm: orcamento.atualizadoEm,
    };
  }
}
