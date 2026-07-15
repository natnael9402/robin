import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [appConfig], cache: true })],
  exports: [ConfigModule],
})
export class AppConfigModule {}
