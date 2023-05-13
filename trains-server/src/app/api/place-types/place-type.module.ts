import { PlaceTypeFeatureService } from "./place-type-feature.service";
import { PlaceTypeController } from './place-type.controller';
import { PlaceTypeService } from './place-type.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import {PlaceType} from "./entities/place-type.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PlaceTypeMapper} from "./place-type.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([PlaceType])],
  controllers: [PlaceTypeController],
  providers: [PlaceTypeService, PlaceTypeMapper, PlaceTypeFeatureService],
  exports: [PlaceTypeService, PlaceTypeMapper, PlaceTypeFeatureService],
})
export class PlaceTypeModule {}
