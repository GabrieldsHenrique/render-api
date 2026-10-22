import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Meta } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { MetaDto, SalvarMetaDto } from './dto/meta.dto';
import {
  type IconeMeta,
  idadeEm,
  LIMITE_METAS,
  mesAtual,
  type TipoMeta,
} from './metas';

@Injectable()
export class MetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosService,
  ) {}

  async listar(usuarioId: string): Promise<MetaDto[]> {
    const metas = await this.prisma.meta.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'asc' },
    });
    const guardados = await this.guardados(usuarioId);
    return metas.map((meta) => this.paraDto(meta, guardados.get(meta.id)));
  }

  async criar(usuarioId: string, dto: SalvarMetaDto): Promise<MetaDto> {
    const total = await this.prisma.meta.count({ where: { usuarioId } });
    if (total >= LIMITE_METAS) {
      throw new BadRequestException(
        `Dá para ter no máximo ${LIMITE_METAS} metas`,
      );
    }
    await this.validar(usuarioId, dto);

    const meta = await this.prisma.meta.create({
      data: { usuarioId, ...this.dados(dto) },
    });
    return this.paraDto(meta);
  }

  async atualizar(
    usuarioId: string,
    id: string,
    dto: SalvarMetaDto,
  ): Promise<MetaDto> {
    await this.validar(usuarioId, dto, id);

    const { count } = await this.prisma.meta.updateMany({
      where: { id, usuarioId },
      data: this.dados(dto),
    });
    if (count === 0) {
      throw new NotFoundException('Meta não encontrada');
    }

    const meta = await this.prisma.meta.findUniqueOrThrow({ where: { id } });
    const guardados = await this.guardados(usuarioId, id);
    return this.paraDto(meta, guardados.get(id));
  }

  async remover(usuarioId: string, id: string): Promise<void> {
    const { count } = await this.prisma.meta.deleteMany({
      where: { id, usuarioId },
    });
    if (count === 0) {
      throw new NotFoundException('Meta não encontrada');
    }
  }

  private async validar(
    usuarioId: string,
    dto: SalvarMetaDto,
    id?: string,
  ): Promise<void> {
    if (dto.tipo === 'data') {
      if (dto.mes && dto.mes <= mesAtual()) {
        throw new BadRequestException('A data da meta precisa ser no futuro');
      }
      return;
    }

    const outra = await this.prisma.meta.findFirst({
      where: {
        usuarioId,
        tipo: 'aposentadoria',
        ...(id ? { NOT: { id } } : {}),
      },
      select: { id: true },
    });
    if (outra) {
      throw new ConflictException('Você já tem uma meta de aposentadoria');
    }

    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const idade = idadeEm(usuario.dataNascimento);
    if (dto.idadeAposentar !== undefined && dto.idadeAposentar <= idade) {
      throw new BadRequestException(
        `A idade para se aposentar precisa ser maior que a sua (${idade} anos)`,
      );
    }
  }

  private dados(dto: SalvarMetaDto) {
    const comData = dto.tipo === 'data';
    return {
      tipo: dto.tipo,
      nome: dto.nome,
      icone: dto.icone,
      jaTem: dto.jaTem ?? 0,
      valor: comData ? dto.valor : null,
      mes: comData ? dto.mes : null,
      rendaMensal: comData ? null : dto.rendaMensal,
      idadeAposentar: comData ? null : dto.idadeAposentar,
    };
  }

  private async guardados(
    usuarioId: string,
    metaId?: string,
  ): Promise<Map<string, number>> {
    const somas = await this.prisma.lancamento.groupBy({
      by: ['metaId'],
      where: { usuarioId, metaId: metaId ?? { not: null } },
      _sum: { valorTotal: true },
    });
    return new Map(
      somas
        .filter((soma) => soma.metaId !== null)
        .map((soma) => [
          soma.metaId as string,
          soma._sum.valorTotal?.toNumber() ?? 0,
        ]),
    );
  }

  private paraDto(meta: Meta, guardado = 0): MetaDto {
    return {
      id: meta.id,
      tipo: meta.tipo as TipoMeta,
      nome: meta.nome,
      icone: meta.icone as IconeMeta,
      jaTem: meta.jaTem.toNumber(),
      guardado,
      valor: meta.valor?.toNumber() ?? null,
      mes: meta.mes,
      rendaMensal: meta.rendaMensal?.toNumber() ?? null,
      idadeAposentar: meta.idadeAposentar,
      atualizadoEm: meta.atualizadoEm,
    };
  }
}
