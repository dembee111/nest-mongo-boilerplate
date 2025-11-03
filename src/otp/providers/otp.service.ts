import {
  Inject,
  Injectable,
  BadRequestException,
  RequestTimeoutException,
  forwardRef,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { VerifyPhoneDto } from '../dtos/verify-phone.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { RedisService } from 'src/redis/redis.service';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly redis: RedisService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async sendOtpSkytel(sendTo, message) {
    const url = process.env.WEB_SMS;
    const params = {
      token: process.env.SKYTEL_TOKEN,
      sendto: sendTo,
      message: message,
    };

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    try {
      console.log('fullUrl', fullUrl);
      const response = await fetch(fullUrl, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json().catch(() => response.text()); // response төрлийг динамик танина
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  async sendOtpToPhone(
    verifyPhoneDto: VerifyPhoneDto,
    user: ActiveUserData,
  ): Promise<string> {
    try {
      const existingUser = await this.usersService.findOneById(user.sub);
      if (!existingUser) throw new Error('Ийм хэрэглэгч олдсонгүй');

      const otp = String(randomInt(100000, 999999));

      // 2. Redis-д хадгалах (5 минут)
      await this.redis.set(`otp:${verifyPhoneDto.phone}`, otp, 'EX', 300);

      // 3. (SMS API-г энд дуудах)
      const message = `Tanii batalgaajuulah code: ${otp}`;
      await this.sendOtpSkytel(verifyPhoneDto.phone, message);

      return 'Таны гар утас руу баталгаажуулах код илгээсэн';
    } catch (error) {
      console.log('🚀 ~ OtpService ~ sendOtpToPhone ~ error:', error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try again later',
        {
          description: 'Error fetching user from database',
        },
      );
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    try {
      const cached = await this.redis.get(`otp:${phone}`);
      if (!cached) throw new BadRequestException('OTP expired or not found');

      const cachedStr = String(cached).trim();
      const otpStr = String(otp).trim();

      if (cachedStr !== otpStr) {
        console.log('❌ OTP mismatch', { cachedStr, otpStr });
        throw new BadRequestException('Invalid OTP');
      }

      // 1 удаа баталгаажсаны дараа устгана
      await this.redis.del(`otp:${phone}`);
      return true;
    } catch (error) {
      console.log('🚀 ~ OtpService ~ verifyOtp ~ error:', error);
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try again later',
        {
          description: 'Error fetching user from database',
        },
      );
    }
  }
}
