export const CATEGORIAS_ORCAMENTO = [
  'moradia',
  'contas',
  'mercado',
  'transporte',
  'saude',
  'educacao',
  'lazer',
  'delivery',
  'assinaturas',
  'compras',
  'reserva',
  'investimentos',
  'dividas',
] as const;

export type CategoriaOrcamento = (typeof CATEGORIAS_ORCAMENTO)[number];

export const TRILHA_DA_PLANILHA = 1;

export const VALOR_MAXIMO = 9_999_999_999.99;

export const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export const PARCELAS_MAXIMAS = 24;

export const DESCRICAO_MAXIMA = 60;

export const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function inicioDoMes(mes: string, deslocamento = 0): Date {
  const [ano, numero] = mes.split('-').map(Number);
  return new Date(Date.UTC(ano, numero - 1 + deslocamento, 1));
}

export function mesesEntre(data: Date, mes: string): number {
  const inicio = inicioDoMes(mes);
  return (
    (inicio.getUTCFullYear() - data.getUTCFullYear()) * 12 +
    (inicio.getUTCMonth() - data.getUTCMonth())
  );
}

export function paraData(texto: string): Date {
  return new Date(`${texto}T00:00:00Z`);
}

export function paraTexto(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function hoje(): string {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return paraTexto(local);
}

export function valorDaParcela(
  valorTotal: number,
  parcelas: number,
  parcela: number,
): number {
  const centavos = Math.round(valorTotal * 100);
  const base = Math.floor(centavos / parcelas);
  const ultima = centavos - base * (parcelas - 1);
  return (parcela === parcelas ? ultima : base) / 100;
}
