import { Body, Controller, Delete, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Put, Query, SerializeOptions, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { AbstractMongoEntity } from '../../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../../utils/abstract-mongo-service.controller';
import { AbstractMongoDtoMapper } from '../../../utils/abstract-dto-mapper';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument, DeepPartial } from 'mongoose';
import { Wallet, WalletDto } from './wallet.model';

export enum UserScope {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Schema({ collection: 'users' })
export class User extends AbstractMongoEntity {
  @Prop({ required: true })
  @Expose()
  username: string;

  @Prop({ required: true })
  @Expose()
  password: string;

  @Prop({ required: true, unique: true })
  @Expose()
  email: string;

  @Prop({ required: true, enum: UserScope })
  @Expose()
  scope: UserScope;

  @Prop({ type: Object })
  @Expose()
  preferences?: any;

  @Prop({ type: Object })
  @Expose()
  wallet?: { gold: number; gems: number; parts: number; content: any };
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
  scope: UserScope;
  preferences?: any;
}

export class UpdateUserDto {
  email: string;
  username: string;
  password: string;
  scope: UserScope;
  preferences?: any;
}

export interface UserDto {
  id?: string;
  username: string;
  email: string;
  password?: string;
  scope: UserScope;
  preferences?: any;
  wallet?: WalletDto;
  created?: string;
  updated?: string;
}

@Injectable()
export class UsersService extends AbstractMongoService<User> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    super(userModel);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      return {
        ...user.toObject(),
        id: user._id?.toString()
      } as unknown as User;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getById(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto): Promise<User> {
    return super.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      scope: userData.scope,
      preferences: userData.preferences,
    } as DeepPartial<User>);
  }

  async replace(userId: string, userData: UpdateUserDto): Promise<User> {
    const existing = await this.findOne(userId);
    if (!existing) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const updated = await this.update(userId, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      scope: userData.scope,
      preferences: userData.preferences,
    } as DeepPartial<User>);

    if (updated) {
      return updated;
    }
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async remove(userId: string): Promise<boolean> {
    const result = await this.delete(userId);
    if (!result) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return true;
  }
}

@Injectable()
export class UsersMapper extends AbstractMongoDtoMapper<User, UserDto> {
  async toDto(domain: User): Promise<UserDto> {
    if (!domain) {
      return null;
    }

    return {
      id: (domain as any).id || (domain as any)._id?.toString(),
      username: domain.username,
      email: domain.email,
      scope: domain.scope,
      preferences: domain.preferences,
      wallet: domain.wallet ? {
        id: (domain as any).id || (domain as any)._id?.toString(),
        gold: domain.wallet.gold,
        gems: domain.wallet.gems,
        parts: domain.wallet.parts,
        content: domain.wallet.content,
      } : undefined,
      created: domain.created?.toISOString(),
      updated: domain.updated?.toISOString(),
    };
  }

  async toDomain(dto: any, domain?: User | Partial<User>): Promise<User> {
    if (!dto) {
      return domain as User;
    }

    if (!domain) {
      domain = {} as Partial<User>;
    }

    return {
      ...domain,
      username: dto.username,
      email: dto.email,
      password: dto.password ? (dto.password.length < 60 ? bcrypt.hashSync(dto.password, 10) : dto.password) : (domain as any).password,
      scope: dto.scope,
      preferences: dto.preferences,
    } as User;
  }
}

@Controller('users')
@SerializeOptions({
  strategy: 'excludeAll'
})
@UseFilters(AllExceptionsFilter)
export class UsersController extends AbstractMongoServiceController<User, UserDto> {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersMapper: UsersMapper
  ) {
    super(usersService, usersMapper);
  }

  @Get()
  @UseGuards(LoggedIn, Admin)
  async getAllUsers() {
    const { PageRequestDto } = await import('../../../models/pagination.model');
    return this.service.findAll(new PageRequestDto());
  }

  @Get('/by-email/:email')
  @UseGuards(LoggedIn, Admin)
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.getByEmail(email).then(user => this.usersMapper.toDto(user));
  }

  @Post()
  @UseGuards(LoggedIn, Admin)
  async createUser(@Body() user: CreateUserDto) {
    return this.service.create(user as any).then(created => this.usersMapper.toDto(created));
  }

  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  async replaceUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.usersService.replace(id, user).then(updated => this.usersMapper.toDto(updated));
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper],
  exports: [UsersService]
})
export class UsersModule {}
