import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { UserSerializer } from '../serializer/user.serializer';

@Injectable()
export class CreateUserProvider {
  constructor(
    /**
     * Inject UserModel
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    /**
     * Inject BCrypt Provider
     */
    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    // 1. Хэрэглэгчийн имэйл бүртгэлтэй эсэхийг шалгах
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new BadRequestException(
        'The user already exists, please check your email',
      );
    }

    // 2. Шинэ хэрэглэгч үүсгэх
    try {
      const newUser = new this.userModel({
        ...createUserDto,
        password: await this.hashingProvider.hashPassword(
          createUserDto.password,
        ),
      });
      const saved = await newUser.save();
      return UserSerializer.sanitize(saved);
    } catch (error) {
      // 3. Холболтын болон бусад алдаа барих
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try again later',
        {
          description: 'Error saving user to database',
        },
      );
    }
  }
}
