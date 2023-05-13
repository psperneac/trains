import { Module } from '@nestjs/common';
import { PlaceFeatureService } from "./place-feature.service";
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../../../authentication/authentication.module';
import Place from './place.entity';
import { PlaceMapper } from './place.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Place]), AuthenticationModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper, PlaceFeatureService],
  exports: [PlacesService, PlaceMapper, PlaceFeatureService],
})
export class PlacesModule {}
