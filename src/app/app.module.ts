import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@shared/modules/env-config.module';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';

@Module({
  imports: [EnvConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
