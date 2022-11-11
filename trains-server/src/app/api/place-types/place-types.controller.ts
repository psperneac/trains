import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters, UseGuards} from '@nestjs/common';
import {AllExceptionsFilter} from "../../../utils/all-exceptions.filter";
import {PlaceTypesService} from "./place-types.service";
import {PlaceTypeMapper} from "./place-type.mapper";
import {Admin, LoggedIn} from "../../../authentication/authentication.guard";
import {PageRequestDto} from "../../../models/pagination.model";
import Place from "../places/place.entity";
import {PlaceTypeDto} from "./dto/place-type.dto";

@Controller('place-types')
@UseFilters(AllExceptionsFilter)
export class PlaceTypesController {
  constructor(
    private readonly service: PlaceTypesService,
    private readonly mapper: PlaceTypeMapper
  ) {}


  @Get()
  @UseGuards(LoggedIn)
  findAll(@Query() pagination: PageRequestDto) {
    return this.service.findAll(pagination).then((page) => ({
      ...page,
      data: page?.data?.map((item) => this.mapper.toDto(item)),
    }));
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(LoggedIn, Admin)
  create(@Body() createPlaceTypeDto: PlaceTypeDto) {
    return this.service.create(createPlaceTypeDto);
  }

  @Patch(':id')
  @UseGuards(LoggedIn, Admin)
  update(@Param('id') id: string, @Body() updatePlaceTypeDto: PlaceTypeDto) {
    return this.service.update(id, updatePlaceTypeDto);
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
