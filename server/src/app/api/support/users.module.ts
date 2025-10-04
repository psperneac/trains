import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
  Param,
  Post,
  Put,
  SerializeOptions,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { Admin, LoggedIn } from 'src/authentication/authentication.guard';
import { CreateUserDto, UpdateUserDto } from 'src/models/user.model';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { AllExceptionsFilter } from 'src/utils/all-exceptions.filter';
import { Column, Entity, Repository } from 'typeorm';

export class UserPreference {
  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface UserPreferenceDto {
  id: string;
  userId: string;
  content: any;
}

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column()
  @Expose()
  public username: string;

  @Column()
  public password: string;

  @Column()
  @Expose()
  public email: string;

  @Column()
  @Expose()
  public scope: string;

  @Column()
  @Expose()
  public preferences?: UserPreference;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  getAll() {
    return this.usersRepository.find();
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ _id: new Types.ObjectId(userId) });
    if (user) {
      console.log('user', user);
      console.log('user._id', user._id);
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create({
      _id: new Types.ObjectId(),
      ...userData
    });
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async replace(uuid: string, user: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uuid, user);
    const updatedUser = await this.usersRepository.findOne({ where: { _id: new Types.ObjectId(uuid) } });
    if (updatedUser) {
      return updatedUser;
    }

    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async delete(uuid: string): Promise<boolean> {
    const deleteResponse = await this.usersRepository.delete(uuid);
    if (!deleteResponse.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}

@Controller('users')
@UseGuards(LoggedIn, Admin)
@SerializeOptions({
  strategy: 'excludeAll'
})
@UseFilters(AllExceptionsFilter)
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

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
