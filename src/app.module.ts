import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IndicadoresModule } from './indicadores/indicadores.module';
import { PrismaModule } from './prisma/prisma.module';
import { PlanilhaModule } from './planilha/planilha.module';
import { ProgressoModule } from './progresso/progresso.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProgressoModule,
    PlanilhaModule,
    IndicadoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
