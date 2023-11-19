import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

import { EnvConfigService } from '@shared/services/env-config.service';

export const EnvironmentVariablesValidation = z.object({
  PORT: z.coerce.number().nonnegative().min(1024),
});

export type TEnvironmentVariables = z.infer<
  typeof EnvironmentVariablesValidation
>;
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [`.env`],
      validate: (config) => {
        const parsed = EnvironmentVariablesValidation.parse(config);
        // This to make data types coerced
        return { ...config, ...parsed };
      },
    }),
  ],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule {}
