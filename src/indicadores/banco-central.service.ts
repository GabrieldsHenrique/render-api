import { Injectable } from '@nestjs/common';
import {
  dataBrasileira,
  dataIso,
  FILTRO_FOCUS_INFLACAO,
  SERIE_CDI,
  TEMPO_LIMITE_BC,
  URL_FOCUS_INFLACAO,
  URL_HISTORICO_SELIC,
  URL_SGS,
} from './indicadores';
import { Registro, ValorIndicador } from './indicadores.model';

@Injectable()
export class BancoCentralService {
  async buscarSelic(): Promise<ValorIndicador> {
    const resposta = await this.buscarJson(URL_HISTORICO_SELIC);
    const vigente = this.lista(this.campo(resposta, 'conteudo')).find(
      (reuniao) => reuniao['DataFimVigencia'] === null,
    );
    if (!vigente) {
      throw new Error('Nenhuma Selic vigente no histórico do Copom');
    }
    return {
      valor: this.numero(vigente['MetaSelic']),
      referencia: dataIso(this.texto(vigente['DataInicioVigencia'])),
    };
  }

  async buscarCdi(): Promise<ValorIndicador> {
    const resposta = await this.buscarJson(
      `${URL_SGS}.${SERIE_CDI}/dados/ultimos/1?formato=json`,
    );
    const [ultimo] = this.lista(resposta);
    if (!ultimo) {
      throw new Error('Série do CDI veio vazia');
    }
    return {
      valor: this.numero(ultimo['valor']),
      referencia: dataBrasileira(this.texto(ultimo['data'])),
    };
  }

  async buscarIpcaEsperado(): Promise<ValorIndicador> {
    const parametros = [
      '$top=1',
      `$filter=${encodeURIComponent(FILTRO_FOCUS_INFLACAO)}`,
      `$orderby=${encodeURIComponent('Data desc')}`,
      '$format=json',
    ].join('&');

    const resposta = await this.buscarJson(
      `${URL_FOCUS_INFLACAO}?${parametros}`,
    );
    const [ultima] = this.lista(this.campo(resposta, 'value'));
    if (!ultima) {
      throw new Error('Pesquisa Focus veio vazia');
    }
    return {
      valor: this.numero(ultima['Mediana']),
      referencia: dataIso(this.texto(ultima['Data'])),
    };
  }

  private async buscarJson(url: string): Promise<unknown> {
    const resposta = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TEMPO_LIMITE_BC),
    });
    const tipo = resposta.headers.get('content-type') ?? '';
    if (!resposta.ok || !tipo.includes('json')) {
      throw new Error(
        `Banco Central respondeu ${resposta.status} (${tipo || 'sem tipo'})`,
      );
    }
    return resposta.json();
  }

  private campo(dado: unknown, nome: string): unknown {
    return this.registro(dado)[nome];
  }

  private lista(dado: unknown): Registro[] {
    if (!Array.isArray(dado)) {
      throw new Error('Resposta do Banco Central não é uma lista');
    }
    const itens: unknown[] = dado;
    return itens.map((item) => this.registro(item));
  }

  private registro(dado: unknown): Registro {
    if (typeof dado !== 'object' || dado === null || Array.isArray(dado)) {
      throw new Error('Resposta do Banco Central em formato inesperado');
    }
    return dado as Registro;
  }

  private numero(valor: unknown): number {
    const numero = typeof valor === 'string' ? Number(valor) : valor;
    if (typeof numero !== 'number' || !Number.isFinite(numero)) {
      throw new Error(`Valor inválido do Banco Central: ${String(valor)}`);
    }
    return numero;
  }

  private texto(valor: unknown): string {
    if (typeof valor !== 'string') {
      throw new Error(`Data inválida do Banco Central: ${String(valor)}`);
    }
    return valor;
  }
}
