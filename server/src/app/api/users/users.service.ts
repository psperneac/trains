import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './users.entity';
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

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email }});
    if (user) {
      return user;
    }
    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async getById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId }});
    if (user) {
      return user;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

  async create(userData: CreateUserDto): Promise<User> {
    const newUser = await this.usersRepository.create({
      ...userData,
    });
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async replace(uuid: string, user: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(uuid, user);
    const updatedUser = await this.usersRepository.findOne({ where: { id: uuid }});
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
