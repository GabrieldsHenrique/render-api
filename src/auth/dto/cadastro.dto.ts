import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Equals,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IdadeMinima } from '../../common/validators/idade-minima.validator';

export class CadastroDto {
  @ApiProperty({
    description: 'Nome pelo qual o Dinho chama o usuário',
    example: 'Ana Souza',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Informe seu nome' })
  @IsNotEmpty({ message: 'Informe seu nome' })
  @MaxLength(60, { message: 'O nome pode ter no máximo 60 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'E-mail de login (salvo em minúsculas, sem espaços)',
    example: 'ana@email.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    description: 'Data no formato AAAA-MM-DD. Idade mínima: 18 anos',
    example: '2000-05-10',
  })
  @IsDateString({ strict: true }, { message: 'Data de nascimento inválida' })
  @IdadeMinima(18)
  dataNascimento: string;

  @ApiProperty({
    description: 'Entre 8 e 64 caracteres',
    example: 'senhaforte123',
  })
  @IsString({ message: 'Informe sua senha' })
  @MinLength(8, { message: 'A senha precisa ter pelo menos 8 caracteres' })
  @MaxLength(64, { message: 'A senha pode ter no máximo 64 caracteres' })
  senha: string;

  @ApiProperty({
    description:
      'Precisa ser true: aceite dos termos de uso e da política de privacidade',
    example: true,
  })
  @Equals(true, {
    message: 'É preciso aceitar os termos de uso e a política de privacidade',
  })
  aceitouTermos: boolean;
}
