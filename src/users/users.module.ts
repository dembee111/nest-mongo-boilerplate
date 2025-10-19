import { Module, forwardRef } from '@nestjs/common';
import { User, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './providers/users.service';
import { UsersCreateManyProvider } from './providers/users-create-many.provider';
import { CreateUserProvider } from './providers/create-user.provider';
import profileConfig from './config/profile.config';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersCreateManyProvider, CreateUserProvider],
  exports: [UsersService],
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    ConfigModule.forFeature(profileConfig),
    forwardRef(() => AuthModule),
  ],
})
export class UsersModule {}
