import { IsNotEmpty } from 'class-validator';

export class FacebookTokenDto {
  @IsNotEmpty()
  token: string;
}
