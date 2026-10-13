import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bom dia, seja bem-vindo ao meu projeto NestJS!';
  }
}
