import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';
import { FacebookTokenDto } from '../dtos/facebook-token.dto';

@Injectable()
export class FacebookAuthenticationService implements OnModuleInit {
  private clientId: string;
  private clientSecret: string;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  onModuleInit() {
    this.clientId =
      this.jwtConfiguration.facebookClientId || process.env.FACEBOOK_CLIENT_ID;
    this.clientSecret =
      this.jwtConfiguration.facebookClientSecret ||
      process.env.FACEBOOK_SECRET_ID;
  }

  async authenticate(facebookTokenDto: FacebookTokenDto) {
    const { token } = facebookTokenDto;

    try {
      /**
       * 1. Facebook access token шалгах (debug_token endpoint)
       */
      const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${this.clientId}|${this.clientSecret}`;
      const debugResponse = await fetch(debugUrl);
      const debugData = await debugResponse.json();

      if (!debugData?.data?.is_valid) {
        throw new UnauthorizedException('Facebook access token is invalid');
      }

      /**
       * 2. Token хүчинтэй бол хэрэглэгчийн мэдээлэл авах
       */
      const profileUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`;
      const profileResponse = await fetch(profileUrl);
      const profile = await profileResponse.json();

      if (!profile?.id) {
        throw new UnauthorizedException('Unable to fetch Facebook user info');
      }
      /**
       * 3. Хэрэглэгчийг DB-д шалгах эсвэл шинээр үүсгэх
       */
      let user = await this.usersService.findOneByFacebookId(profile.id);

      // If user id found generate the tokens
      if (user) {
        return await this.generateTokensProvider.generateTokens(user);
      } else {
        // If not create a new user and generate the tokens
        const newUser = await this.usersService.createFacebookUser({
          firstName: profile.name,
          lastName: profile.name,
          email: profile.email,
          facebookId: profile.id,
        });
        return await this.generateTokensProvider.generateTokens(newUser);
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      throw new UnauthorizedException('Facebook authentication failed');
    }
  }
}
