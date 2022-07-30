import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { PageRequestDto } from '../../../models/pagination.model';
import { TranslationDto } from './dto/translation.dto';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { TranslationMapper } from './translation.mapper';
import { TranslationsService } from './translations.service';

@Controller('translations')
@UseFilters(AllExceptionsFilter)
export class TranslationsController {
  constructor(
    private readonly service: TranslationsService,
    private readonly mapper: TranslationMapper,
  ) {
  }

  @Get()
  @UseGuards(LoggedIn)
  getAll(@Query() pagination: PageRequestDto) {
    return this.service.getAll(pagination).then((page) => ({
      ...page,
      data: page?.data?.map((item) => this.mapper.toDto(item)),
    }));
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  getOn(@Param('id') id: string) {
    return this.service.getOne(id).then((item) => {
      if (item) {
        return this.mapper.toDto(item);
      }
      throw new HttpException('Translation not found', HttpStatus.NOT_FOUND);
    });
  }

  @Post()
  @UseGuards(LoggedIn, Admin)
  create(@Body() dto: TranslationDto) {
    return this.service
      .create(this.mapper.toDomain(dto))
      .then((newTranslation) => this.mapper.toDto(newTranslation));
  }

  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  update(@Param('id') id: string, @Body() dto: TranslationDto) {
    return this.service
      .getOne(id)
      .then((item) => {
        if (!item) {
          throw new HttpException(
            'Translation not found',
            HttpStatus.NOT_FOUND,
          );
        }

        return this.service.update(id, this.mapper.toDomain(dto, item));
      })
      .then((result) => this.mapper.toDto(result));
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
