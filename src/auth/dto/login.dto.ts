import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail usado no cadastro',
    example: 'ana@email.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'senhaforte123' })
  @IsString({ message: 'Informe sua senha' })
  @IsNotEmpty({ message: 'Informe sua senha' })
  senha: string;
}
