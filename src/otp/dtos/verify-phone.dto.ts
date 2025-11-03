import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class VerifyPhoneDto {
  @Matches(/^[89]\d{7}$/, {
    message:
      'Phone must be a valid 8-digit Mongolian number starting with 8 or 9',
  })
  phone: string;
}
