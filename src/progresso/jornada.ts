export const FASE_MAXIMA = 99;
export const XP_POR_FASE = 30;
export const XP_REVISAO = 50;

export interface TrilhaJornada {
  id: number;
  faseInicial: number;
  faseFinal: number;
}

export const TRILHAS: TrilhaJornada[] = [
  { id: 1, faseInicial: 0, faseFinal: 14 },
  { id: 2, faseInicial: 15, faseFinal: 34 },
  { id: 3, faseInicial: 35, faseFinal: 54 },
  { id: 4, faseInicial: 55, faseFinal: 74 },
  { id: 5, faseInicial: 75, faseFinal: 99 },
];

export function trilhaPorId(id: number): TrilhaJornada | undefined {
  return TRILHAS.find((trilha) => trilha.id === id);
}

export function trilhaDaFase(fase: number): TrilhaJornada | undefined {
  return TRILHAS.find(
    (trilha) => fase >= trilha.faseInicial && fase <= trilha.faseFinal,
  );
}

export function xpDaFase(fase: number): number {
  const ehRevisao = TRILHAS.some((trilha) => trilha.faseFinal === fase);
  return ehRevisao ? XP_REVISAO : XP_POR_FASE;
}

export const XP_JORNADA_COMPLETA = Array.from(
  { length: FASE_MAXIMA + 1 },
  (_, fase) => xpDaFase(fase),
).reduce((total, xp) => total + xp, 0);
