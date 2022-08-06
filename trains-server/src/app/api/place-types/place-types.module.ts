import { PlaceTypesController } from './place-types.controller';
import { PlaceTypesService } from './place-types.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService],
})
export class PlaceTypesModule {}
