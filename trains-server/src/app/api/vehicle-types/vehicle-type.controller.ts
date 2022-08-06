import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, Query } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleTypeMapper } from './vehicle-type.mapper';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { PageRequestDto } from '../../../models/pagination.model';

@Controller('vehicle-types')
@UseFilters(AllExceptionsFilter)
export class VehicleTypeController {
  constructor(private readonly service: VehicleTypeService, private readonly mapper: VehicleTypeMapper) {}

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
  create(@Body() createVehicleTypeDto: VehicleTypeDto) {
    return this.service.create(createVehicleTypeDto);
  }

  @Patch(':id')
  @UseGuards(LoggedIn, Admin)
  update(@Param('id') id: string, @Body() updateVehicleTypeDto: VehicleTypeDto) {
    return this.service.update(id, updateVehicleTypeDto);
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
