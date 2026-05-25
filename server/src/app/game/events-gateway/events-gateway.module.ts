import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthenticationModule } from '../../../authentication/authentication.module';
import { AuthenticationService } from '../../../authentication/authentication.service';
import { PlaceInstancesModule } from '../../api/place-instance.module';
import { VehicleInstancesModule } from '../../api/vehicle-instances.module';
import { EventsGateway } from './events-gateway';

@Module({
  imports: [
    AuthenticationModule,
    PlaceInstancesModule,
    VehicleInstancesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`
        }
      })
    })
  ],
  providers: [EventsGateway],
  exports: [EventsGateway]
})
export class EventsGatewayModule {}