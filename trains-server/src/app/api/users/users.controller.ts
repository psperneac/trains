import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ExceptionsLoggerFilter } from '../../../utils/exceptions-logger.filter';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { CreateUserDto, UpdateUserDto } from '../../../models/user.model';

@Controller('users')
@UseGuards(LoggedIn, Admin)
@SerializeOptions({
  strategy: 'excludeAll',
})
@UseFilters(ExceptionsLoggerFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.getAll();
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Get('/by-email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.getByEmail(email);
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Put(':id')
  async replaceUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.replace(id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
