import { ApiProperty } from '@nestjs/swagger';

export class UsuarioDto {
  @ApiProperty({ example: '3698249c-d7c5-40f0-9b23-c9a6904f3fa9' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  nome: string;

  @ApiProperty({ example: 'ana@email.com' })
  email: string;

  @ApiProperty({ example: '2000-05-10T00:00:00.000Z' })
  dataNascimento: Date;

  @ApiProperty({
    description: 'Quando aceitou os termos de uso e a política de privacidade',
  })
  termosAceitosEm: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
    description:
      'Quando viu o modal de boas-vindas pela primeira vez. null = ainda não viu',
  })
  boasVindasVistaEm: Date | null;

  criadoEm: Date;

  atualizadoEm: Date;
}
