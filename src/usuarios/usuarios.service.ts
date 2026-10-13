import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  buscarPorId(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      omit: { senhaHash: true },
    });
  }

  async marcarBoasVindasVista(id: string) {
    await this.prisma.usuario.updateMany({
      where: { id, boasVindasVistaEm: null },
      data: { boasVindasVistaEm: new Date() },
    });
    return this.buscarPorId(id);
  }

  buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async criar(dados: Prisma.UsuarioCreateInput) {
    try {
      return await this.prisma.usuario.create({
        data: dados,
        omit: { senhaHash: true },
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException('Este e-mail já está cadastrado');
      }
      throw erro;
    }
  }
}
