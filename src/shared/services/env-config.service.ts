import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEnvironmentVariables } from '@shared/modules/env-config.module';

@Injectable()
export class EnvConfigService extends ConfigService<TEnvironmentVariables> {}
