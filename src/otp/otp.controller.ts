import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './providers/otp.service';
import { VerifyPhoneDto } from './dtos/verify-phone.dto';
import { ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Controller('otp')
@ApiTags('Users')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  public sendToVerifyRequest(
    @Body() verifyPhoneDto: VerifyPhoneDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.otpService.sendOtpToPhone(verifyPhoneDto, user);
  }
}
