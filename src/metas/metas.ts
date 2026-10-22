export const TRILHA_DO_PLANEJADOR = 5;

export const TIPOS_META = ['data', 'aposentadoria'] as const;

export type TipoMeta = (typeof TIPOS_META)[number];

export const ICONES_META = [
  'viagem',
  'casa',
  'carro',
  'estudo',
  'casamento',
  'filho',
  'presente',
  'reserva',
  'aposentadoria',
  'outro',
] as const;

export type IconeMeta = (typeof ICONES_META)[number];

export const LIMITE_METAS = 12;

export const NOME_MAXIMO = 40;

export const VALOR_MAXIMO = 9_999_999_999.99;

export const IDADE_MAXIMA_APOSENTADORIA = 90;

export const FORMATO_MES = /^\d{4}-(0[1-9]|1[0-2])$/;

export function mesAtual(): string {
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 7);
}

export function idadeEm(nascimento: Date, hoje = new Date()): number {
  const idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const fezAniversario =
    hoje.getUTCMonth() > nascimento.getUTCMonth() ||
    (hoje.getUTCMonth() === nascimento.getUTCMonth() &&
      hoje.getUTCDate() >= nascimento.getUTCDate());
  return fezAniversario ? idade : idade - 1;
}
