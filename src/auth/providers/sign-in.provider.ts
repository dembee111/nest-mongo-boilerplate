import {
  Inject,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { SignInDto } from '../dtos/signin.dto';
import { HashingProvider } from './hashing.provider';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class SignInProvider {
  constructor(
    // Injecting UserService
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    /**
     * Inject the hashingProvider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Inject jwtService
     */
    private readonly jwtService: JwtService,

    /**
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async signIn(signInDto: SignInDto) {
    try {
      // find user by email ID
      let user = await this.usersService.findOneByEmail(signInDto.email);

      // Throw exception if user is not found
      // Above | Taken care by the findInByEmail method

      let isEqual: boolean = false;

      try {
        // Compare the password to hash
        isEqual = await this.hashingProvider.comparePassword(
          signInDto.password,
          user.password,
        );
      } catch (error) {
        throw new RequestTimeoutException(error, {
          description: 'Could not compare the password',
        });
      }

      if (!isEqual) {
        throw new UnauthorizedException('Password does not match');
      }

      // Generate access token
      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      console.log(error);
    }
  }
}
