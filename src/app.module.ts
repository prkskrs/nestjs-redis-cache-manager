import { CacheInterceptor, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { NormalExceptionFilter } from './filters/normal-exception.filter';
import { ValidationExceptionFilter } from './filters/validator-exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// must have redis store  `brew install redis` and then run `brew services start redis`
// to integrate redis and cache-manager, now install `pnpm install cache-manager-redis-store@^2.0.0`

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CacheModule.register({
      // // store: redisStore,
      // socket: {
      //   host: `localhost`,
      //   port: 6379,
      // },
      isGlobal: true, // this make module globally available
      // ttl: 60, // for 60 sec things will stay in cache
      // max:1000 // max number of items to cache
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // here with this we can use `CacheInterceptor` to all cache in all controller ( `GET` apis )
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NormalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      // Allowing to do validation through DTO
      // Since class-validator library default throw BadRequestException, here we use exceptionFactory to throw
      // their internal exception so that filter can recognize it
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors;
          },
        }),
    },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
