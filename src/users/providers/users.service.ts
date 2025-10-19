import {
  Injectable,
  Inject,
  BadRequestException,
  RequestTimeoutException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../user.schema';
import { Model, Types, ClientSession } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ConfigType } from '@nestjs/config';
import profileConfig from '../config/profile.config';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';
import { CreateUserProvider } from './create-user.provider';
/**
 * Class to connect to Users table and perform business operations
 */
@Injectable()
export class UsersService {
  constructor(
    /**
     * Inject UserModel
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    // Injecting ConfigService
    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    private readonly usersCreateManyProvider: UsersCreateManyProvider,

    /**
     * Inject Create Users Provider
     */
    private readonly createUserProvider: CreateUserProvider,
  ) {}

  /**
   * Method to create a new user
   */
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.createUserProvider.createUser(createUserDto);
  }
  /**
   * The method to get all the users from the database
   */
  public async findAll(limit: number, page: number) {
    try {
      const users = await this.userModel.find().limit(limit);
      if (!users) {
        throw new NotFoundException('Users not found');
      }
      return users;
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
  /**
   * Find a single user using the ID of the user
   */
  public async findOneById(id: string) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user id format');
      }

      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try again later',
        {
          description: 'Error saving user to database',
        },
      );
    }
  }

  /**
   * Find a single user using the email of the user
   */
  public async findOneByEmail(email: string) {
    try {
      if (!email || typeof email !== 'string') {
        throw new BadRequestException('Invalid email format');
      }

      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment, please try again later',
        {
          description: 'Error fetching user from database',
        },
      );
    }
  }

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createManyUsersDto);
  }
}
