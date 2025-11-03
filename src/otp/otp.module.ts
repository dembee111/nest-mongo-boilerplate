import { Module, forwardRef } from '@nestjs/common';
import { OtpService } from './providers/otp.service';
import { OtpController } from './otp.controller';
import { RedisModule } from 'src/redis/redis.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule), RedisModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
