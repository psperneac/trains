import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Seeder } from './seeder';
import { SeederModule } from './seeder.module';

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule)
    .then(appContext => {
      const logger = appContext.get(Logger);
      const seeder = appContext.get(Seeder);

      seeder.seed()
      .then(() => {
        logger.debug('Seeding complete');
      })
      .catch((error) => {
        logger.error('Seeding failed', error);
        throw error;
      })
      .finally(() => appContext.close());
    })
    .catch(error=> {
      throw error;
    });
}

bootstrap();