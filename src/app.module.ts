import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { TagsModule } from './tags/tags.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import enviromentValidation from './config/environment.validation';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { PaginationModule } from './common/pagination/pagination.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UsersModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      validationSchema: enviromentValidation,
      load: [appConfig, databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
        dbName: configService.get('database.dbname'),
      }),
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TagsModule,
    PaginationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
