import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '@app/app.module';
import { EnvConfigService } from '@shared/services/env-config.service';

async function bootstrap() {
  const logger = new Logger('links-grabber-logger');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvConfigService);
  const PORT = configService.get('PORT');
  await app.listen(PORT);
  logger.verbose(`✩✩✩ Api is running in http://localhost:${PORT}`);
}
bootstrap();
