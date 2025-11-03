import { IsString, Matches, IsNotEmpty } from 'class-validator';

export class UpdatePhoneUserDto {
  @Matches(/^[89]\d{7}$/, {
    message:
      'Phone must be a valid 8-digit Mongolian number starting with 8 or 9',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
