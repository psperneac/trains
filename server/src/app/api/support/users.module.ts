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
import { AllExceptionsFilter } from 'src/utils/all-exceptions.filter';
import { Column, Entity, Repository } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';


export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  scope: string;
}

export class UpdateUserDto {
  email: string;
  username: string;
  password: string;
  scope: string;
}

export class UserPreference {
  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export class UserWallet {
  @Column()
  @Expose()
  gems: number;
}

export interface UserPreferenceDto {
  id: string;
  userId: string;
  content: any;
}

export interface UserWalletDto {
  id: string;
  userId: string;
  gems: number;
}

export class UserDto {
  public username: string;
  public email: string;
  public scope: string;
  public preferences?: UserPreference;
  public wallet?: UserWallet;
}

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column()
  public email: string;

  @Column()
  public scope: string;

  @Column({ type: 'json' })
  public preferences?: UserPreference;

  @Column({ type: 'json' })
  public wallet?: UserWallet;
}

@Injectable()
class UserDtoMapper {
  toDto(user: User): UserDto {
    const userDto = new UserDto();
    userDto.email = user.email;
    userDto.username = user.username;
    userDto.scope = user.scope;
    userDto.preferences = user.preferences;
    userDto.wallet = user.wallet;
    return userDto;
  }

  toEntity(userDto: UserDto, user?: User): User {
    const userEntity = user || new User();
    userEntity.email = userDto.email;
    userEntity.username = userDto.username;
    userEntity.scope = userDto.scope;
    userEntity.preferences = userDto.preferences;
    // wallet is removed when mapping from DTO to model
    userEntity.wallet = undefined;
    return userEntity;
  }
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userDtoMapper: UserDtoMapper
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
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto): Promise<UserDto> {
    const newUser = this.usersRepository.create({
      _id: new Types.ObjectId(),
      ...this.userDtoMapper.toEntity(userData as UserDto)
    });
    await this.usersRepository.save(newUser);
    return this.userDtoMapper.toDto(newUser);
  }

  async replace(uuid: string, user: UpdateUserDto): Promise<UserDto> {
    await this.usersRepository.update(uuid, this.userDtoMapper.toEntity(user as UserDto));
    const updatedUser = await this.usersRepository.findOne({ where: { _id: new Types.ObjectId(uuid) } });
    if (updatedUser) {
      return this.userDtoMapper.toDto(updatedUser);
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
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UsersController],
  providers: [UsersService, UserDtoMapper],
  exports: [UsersService]
})
export class UsersModule {}
