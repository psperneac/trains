import { PlaceTypesController } from './place-types.controller';
import { PlaceTypesService } from './place-types.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import {PlaceType} from "./entities/place-type.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PlaceTypeMapper} from "./place-type.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([PlaceType])],
  controllers: [PlaceTypesController],
  providers: [PlaceTypesService, PlaceTypeMapper],
  exports: [PlaceTypesService, PlaceTypeMapper],
})
export class PlaceTypesModule {}
