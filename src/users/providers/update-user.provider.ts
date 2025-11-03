import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { UpdatePhoneUserDto } from '../dtos/update-phone-user.dto';
import { OtpService } from 'src/otp/providers/otp.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class UpdateUserProvider {
  constructor(
    /**
     * Inject UserModel
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly otpService: OtpService,
  ) {}

  public async updatePhoneUser(
    updatePhoneUserDto: UpdatePhoneUserDto,
    user: ActiveUserData,
  ): Promise<User> {
    const { phone, otp } = updatePhoneUserDto;
    // 1. Хэрэглэгч байгаа эсэхийг шалгах
    const existingUser = await this.userModel.findById(user.sub);

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    const verified = await this.otpService.verifyOtp(phone, otp);
    if (!verified) throw new BadRequestException('OTP verification failed');

    // 2. Утасны дугаар аль нэг хэрэглэгчид бүртгэлтэй эсэхийг шалгах (unique учраас)
    const phoneExists = await this.userModel.findOne({ phone });
    if (phoneExists && phoneExists._id.toString() !== user.sub) {
      throw new BadRequestException('This phone number is already in use');
    }

    // 3. Утасны дугаарыг шинэчлэх
    existingUser.phone = phone;

    try {
      return await existingUser.save();
    } catch (error) {
      console.log('🚀 ~ UpdateUserProvider ~ updatePhoneUser ~ error:', error);
      throw new RequestTimeoutException(
        'Unable to update phone number at the moment, please try again later',
        { description: 'Error updating user phone' },
      );
    }
  }
}
