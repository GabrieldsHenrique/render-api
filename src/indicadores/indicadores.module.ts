import { Module } from '@nestjs/common';
import { BancoCentralService } from './banco-central.service';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresService } from './indicadores.service';

@Module({
  controllers: [IndicadoresController],
  providers: [IndicadoresService, BancoCentralService],
  exports: [IndicadoresService],
})
export class IndicadoresModule {}
