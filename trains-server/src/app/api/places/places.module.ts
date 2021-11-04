import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationModule } from '../../../authentication/authentication.module';
import Place from './place.entity';
import { PlaceMapper } from './place.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Place]), AuthenticationModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper],
  exports: [PlacesService, PlaceMapper],
})
export class PlacesModule {}
