import { registerDecorator, ValidationOptions } from 'class-validator';

export function calcularIdade(nascimento: Date, hoje = new Date()): number {
  let idade = hoje.getUTCFullYear() - nascimento.getUTCFullYear();
  const mesAtual = hoje.getUTCMonth();
  const mesNascimento = nascimento.getUTCMonth();
  const jaFezAniversario =
    mesAtual > mesNascimento ||
    (mesAtual === mesNascimento &&
      hoje.getUTCDate() >= nascimento.getUTCDate());
  if (!jaFezAniversario) idade--;
  return idade;
}

export function IdadeMinima(anos: number, options?: ValidationOptions) {
  return function (objeto: object, propriedade: string): void {
    registerDecorator({
      name: 'idadeMinima',
      target: objeto.constructor,
      propertyName: propriedade,
      constraints: [anos],
      options: {
        message: `Você precisa ter pelo menos ${anos} anos`,
        ...options,
      },
      validator: {
        validate(valor: unknown): boolean {
          if (typeof valor !== 'string') return false;
          const nascimento = new Date(valor);
          if (Number.isNaN(nascimento.getTime())) return false;
          return calcularIdade(nascimento) >= anos;
        },
      },
    });
  };
}
