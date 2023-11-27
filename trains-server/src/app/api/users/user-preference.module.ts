import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
  Param,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { UserPreference, UserPreferenceDto } from './user-preference.entity';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

@Injectable()
export class UserPreferenceRepository extends RepositoryAccessor<UserPreference> {
  constructor(@InjectRepository(UserPreference) injectedRepo) {
    super(injectedRepo, ['user']);
  }
}

@Injectable()
export class UserPreferencesService extends AbstractService<UserPreference> {
  constructor(repo: UserPreferenceRepository) {
    super(repo);
  }

  public async findByUserId(userId: string): Promise<UserPreference> {
    return userId ? this.repository.findOne({ where: { user: userId } }) : null;
  }
}

@Injectable()
export class UserPreferenceMapper extends AbstractDtoMapper<UserPreference, UserPreferenceDto> {

  constructor(private readonly userService: UsersService) {
    super();
  }

  async toDto(domain: UserPreference): Promise<UserPreferenceDto> {
    if (!domain) {
      return null;
    }

    return {
      id: domain.id,
      userId: domain.user?.id,
      content: domain.content
    };
  }

  async toDomain(dto: any, domain?: Partial<UserPreference> | UserPreference): Promise<UserPreference> {
    if (!dto) {
      return domain as any as UserPreference;
    }

    if (!domain) {
      domain = {};
    }

    const userId = dto.userId ?? domain.user?.id;

    return {
      ...domain,
      user: userId ? await this.userService.getById(userId) : null,
      content: dto.content ?? domain.content
    } as UserPreference
  }
}

@Controller('user-preferences')
@UseFilters(AllExceptionsFilter)
export class UserPreferencesController extends AbstractServiceController<UserPreference, UserPreferenceDto> {
  constructor(service: UserPreferencesService, mapper: UserPreferenceMapper) {
    super(service, mapper);
  }

  @Get('user/:userId')
  @UseGuards(LoggedIn)
  public async findByUserId(@Param('userId') userId: string): Promise<UserPreferenceDto> {
    return (this.service as UserPreferencesService)
      .findByUserId(userId)
      .then(async domain => {
        // if domain not found, return 404
        if (!domain) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        const found = await this.mapper.toDto(domain);

        // mapping can fail too; maybe on secondary entities
        if (!found) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return found;
      })
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be located by userId', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }
}

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([UserPreference])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService, UserPreferenceMapper, UserPreferenceRepository],
  exports: [UserPreferencesService],
})
export class UserPreferenceModule {
}
