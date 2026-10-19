import { Injectable, Logger } from '@nestjs/common';
import { Indicador } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BancoCentralService } from './banco-central.service';
import { IndicadorDto, IndicadoresDto } from './dto/indicadores.dto';
import {
  CODIGOS_INDICADOR,
  CodigoIndicador,
  DIFERENCA_CDI_SELIC,
  INTERVALO_TENTATIVAS,
  textoData,
  VALIDADE_CACHE,
  VALORES_PADRAO,
} from './indicadores';
import { ValorIndicador } from './indicadores.model';

@Injectable()
export class IndicadoresService {
  private readonly logger = new Logger(IndicadoresService.name);
  private atualizacao: Promise<void> | null = null;
  private ultimaTentativa = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bancoCentral: BancoCentralService,
  ) {}

  async obter(): Promise<IndicadoresDto> {
    let salvos = await this.prisma.indicador.findMany();

    if (salvos.length === 0) {
      await this.tentarAtualizar();
      salvos = await this.prisma.indicador.findMany();
    } else if (this.desatualizado(salvos)) {
      void this.tentarAtualizar();
    }

    return this.montar(salvos);
  }

  async atualizar(): Promise<CodigoIndicador[]> {
    const buscas: [CodigoIndicador, Promise<ValorIndicador>][] = [
      ['selic', this.bancoCentral.buscarSelic()],
      ['cdi', this.bancoCentral.buscarCdi()],
      ['ipca-esperado', this.bancoCentral.buscarIpcaEsperado()],
    ];
    const resultados = await Promise.allSettled(
      buscas.map(([, busca]) => busca),
    );

    const atualizados: CodigoIndicador[] = [];
    const buscadoEm = new Date();

    for (const [indice, resultado] of resultados.entries()) {
      const codigo = buscas[indice][0];
      if (resultado.status === 'rejected') {
        this.logger.warn(
          `Não foi possível buscar ${codigo}: ${this.motivo(resultado.reason)}`,
        );
        continue;
      }

      const { valor, referencia } = resultado.value;
      await this.prisma.indicador.upsert({
        where: { codigo },
        create: { codigo, valor, referencia, buscadoEm },
        update: { valor, referencia, buscadoEm },
      });
      atualizados.push(codigo);
    }

    return atualizados;
  }

  private tentarAtualizar(): Promise<void> {
    if (this.atualizacao) {
      return this.atualizacao;
    }
    if (Date.now() - this.ultimaTentativa < INTERVALO_TENTATIVAS) {
      return Promise.resolve();
    }

    this.ultimaTentativa = Date.now();
    this.atualizacao = this.atualizar()
      .then(() => undefined)
      .catch((erro: unknown) => {
        this.logger.error(
          `Falha ao atualizar os indicadores: ${this.motivo(erro)}`,
        );
      })
      .finally(() => {
        this.atualizacao = null;
      });
    return this.atualizacao;
  }

  private desatualizado(salvos: Indicador[]): boolean {
    return CODIGOS_INDICADOR.some((codigo) => {
      const salvo = salvos.find((item) => item.codigo === codigo);
      return !salvo || Date.now() - salvo.buscadoEm.getTime() > VALIDADE_CACHE;
    });
  }

  private montar(salvos: Indicador[]): IndicadoresDto {
    const salvo = (codigo: CodigoIndicador) =>
      salvos.find((item) => item.codigo === codigo);

    const selic = this.paraDto('selic', salvo('selic'));
    return {
      selic,
      cdi: this.cdi(salvo('cdi'), selic),
      ipcaEsperado: this.paraDto('ipca-esperado', salvo('ipca-esperado')),
    };
  }

  private cdi(salvo: Indicador | undefined, selic: IndicadorDto): IndicadorDto {
    const anteriorASelic =
      salvo &&
      selic.referencia !== null &&
      textoData(salvo.referencia) < selic.referencia;

    if (salvo && !anteriorASelic) {
      return this.paraDto('cdi', salvo);
    }
    if (selic.origem === 'padrao') {
      return this.paraDto('cdi');
    }
    return {
      valor: Math.round((selic.valor - DIFERENCA_CDI_SELIC) * 100) / 100,
      origem: 'estimado',
      referencia: selic.referencia,
    };
  }

  private paraDto(codigo: CodigoIndicador, salvo?: Indicador): IndicadorDto {
    if (!salvo) {
      return {
        valor: VALORES_PADRAO[codigo],
        origem: 'padrao',
        referencia: null,
      };
    }
    return {
      valor: salvo.valor.toNumber(),
      origem: 'banco-central',
      referencia: textoData(salvo.referencia),
    };
  }

  private motivo(erro: unknown): string {
    return erro instanceof Error
      ? `${erro.name}: ${erro.message}`
      : String(erro);
  }
}
