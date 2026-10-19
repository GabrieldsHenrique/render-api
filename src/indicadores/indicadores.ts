export const CODIGOS_INDICADOR = ['selic', 'cdi', 'ipca-esperado'] as const;

export type CodigoIndicador = (typeof CODIGOS_INDICADOR)[number];

export const ORIGENS_INDICADOR = [
  'banco-central',
  'estimado',
  'padrao',
] as const;

export type OrigemIndicador = (typeof ORIGENS_INDICADOR)[number];

export const VALORES_PADRAO: Record<CodigoIndicador, number> = {
  selic: 13.75,
  cdi: 13.65,
  'ipca-esperado': 4.5,
};

export const DIFERENCA_CDI_SELIC = 0.1;

export const VALIDADE_CACHE = 12 * 60 * 60_000;

export const INTERVALO_TENTATIVAS = 10 * 60_000;

export const TEMPO_LIMITE_BC = 8_000;

export const URL_HISTORICO_SELIC =
  'https://www.bcb.gov.br/api/servico/sitebcb/historicotaxasjuros';

export const URL_SGS = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

export const SERIE_CDI = 4389;

export const URL_FOCUS_INFLACAO =
  'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses';

export const FILTRO_FOCUS_INFLACAO =
  "Indicador eq 'IPCA' and baseCalculo eq 0 and Suavizada eq 'S'";

export function dataIso(texto: string): Date {
  return new Date(`${texto.slice(0, 10)}T00:00:00Z`);
}

export function textoData(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function dataBrasileira(texto: string): Date {
  const [dia, mes, ano] = texto.split('/');
  return dataIso(`${ano}-${mes}-${dia}`);
}
