import { ApiProperty, PickType } from '@nestjs/swagger';
import { UsuarioDto } from '../../usuarios/dto/usuario.dto';

export class UsuarioLogadoDto extends PickType(UsuarioDto, [
  'id',
  'nome',
  'email',
]) {}

export class RespostaLoginDto {
  @ApiProperty({
    description:
      'Token JWT. Enviar nas rotas protegidas no cabeçalho `Authorization: Bearer <token>`. Vale 7 dias',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  usuario: UsuarioLogadoDto;
}
