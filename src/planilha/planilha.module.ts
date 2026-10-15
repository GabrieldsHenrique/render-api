import { Module } from '@nestjs/common';
import { ProgressoModule } from '../progresso/progresso.module';
import { PlanilhaLiberadaGuard } from './planilha-liberada.guard';
import { PlanilhaController } from './planilha.controller';
import { PlanilhaService } from './planilha.service';

@Module({
  imports: [ProgressoModule],
  controllers: [PlanilhaController],
  providers: [PlanilhaService, PlanilhaLiberadaGuard],
})
export class PlanilhaModule {}
