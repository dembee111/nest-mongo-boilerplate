import { GoogleAuthenticationService } from './providers/google-authentication.service';
import { Body, Controller, Post } from '@nestjs/common';
import { GoogleTokenDto } from './dtos/google-token.dtos';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { FacebookAuthenticationService } from './providers/facebook-authentication.service';
import { FacebookTokenDto } from './dtos/facebook-token.dto';

//ok social controller
@Auth(AuthType.None)
@Controller('auth/facebook-authentication')
export class FacebookAuthenticationController {
  constructor(
    /**
     * Inject googleAuthenticationService
     */
    private readonly facebookAuthenticationService: FacebookAuthenticationService,
  ) {}

  @Post()
  authenticate(@Body() facebookTokenDto: FacebookTokenDto) {
    return this.facebookAuthenticationService.authenticate(facebookTokenDto);
  }
}
