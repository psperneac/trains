import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeDto } from './dto/vehicle-type.dto';

@Controller('vehicle-type')
export class VehicleTypeController {
  constructor(private readonly vehicleTypeService: VehicleTypeService) {}

  @Post()
  create(@Body() createVehicleTypeDto: VehicleTypeDto) {
    return this.vehicleTypeService.create(createVehicleTypeDto);
  }

  @Get()
  findAll() {
    return this.vehicleTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicleTypeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleTypeDto: VehicleTypeDto,
  ) {
    return this.vehicleTypeService.update(+id, updateVehicleTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehicleTypeService.remove(+id);
  }
}
