import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlacesService } from './places.service';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { CreatePlaceDto, UpdatePlaceDto } from '../../../models/place.model';
import { PageRequestDto } from '../../../models/pagination.model';

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {
  }

  @Get()
  @UseGuards(LoggedIn)
  getAll(@Query() pagination: PageRequestDto) {
    return this.placesService.getAll(pagination);
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  getOn(@Param('id') id: string) {
    return this.placesService.getOne(id);
  }

  @Post()
  @UseGuards(LoggedIn, Admin)
  create(@Body() place: CreatePlaceDto) {
    return this.placesService.create(place);
  }

  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  update(@Param('id') id: string, @Body() place: UpdatePlaceDto) {
    return this.placesService.update(id, place);
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  delete(@Param('id') id: string) {
    return this.placesService.delete(id);
  }
}
