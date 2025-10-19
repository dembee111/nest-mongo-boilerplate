import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../user.schema';
import { Model, ClientSession } from 'mongoose';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

@Injectable()
export class UsersCreateManyProvider {
  constructor(
    /**
     * Inject the datasource
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    const session: ClientSession = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      const newUsers: User[] = [];

      for (const dto of createManyUsersDto.users) {
        const newUser = new this.userModel(dto);
        const savedUser = await newUser.save({ session });
        newUsers.push(savedUser);
      }

      // Commit transaction
      await session.commitTransaction();
      return newUsers;
    } catch (error) {
      // Rollback all changes if something fails
      await session.abortTransaction();
      throw new ConflictException(
        'Unable to process your request at the moment, please try later',
        {
          description: 'Transaction failed, rolled back',
        },
      );
    } finally {
      try {
        await session.endSession();
      } catch (error) {
        throw new RequestTimeoutException(
          'Unable to process your request at the moment, please try later',
          {
            description: error,
          },
        );
      }
    }
  }
}
