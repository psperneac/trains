import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './users.entity';
import { CreateUserDto, UpdateUserDto } from '../../../models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  getAll() {
    return this.usersRepository.find();
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getById(userId: string) {
    const user = await this.usersRepository.findOne({ id: userId });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create({
      ...userData
    });
    console.dir(newUser);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async replace(uuid: string, user: UpdateUserDto) {
    await this.usersRepository.update(uuid, user);
    const updatedUser = await this.usersRepository.findOne(uuid);
    if (updatedUser) {
      return updatedUser;
    }

    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  async delete(uuid: string) {
    const deleteResponse = await this.usersRepository.delete(uuid);
    if (!deleteResponse.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}
