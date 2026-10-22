import { Module } from '@nestjs/common';
import { ProgressoModule } from '../progresso/progresso.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { MetasLiberadasGuard } from './metas-liberadas.guard';
import { MetasController } from './metas.controller';
import { MetasService } from './metas.service';

@Module({
  imports: [ProgressoModule, UsuariosModule],
  controllers: [MetasController],
  providers: [MetasService, MetasLiberadasGuard],
})
export class MetasModule {}
