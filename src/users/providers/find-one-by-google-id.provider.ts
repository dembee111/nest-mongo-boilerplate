import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';

@Injectable()
export class FindOneByGoogleIdProvider {
  constructor(
    /**
     * Inject Mongoose userModel
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  public async findOneByGoogleId(googleId: string) {
    return await this.userModel
      .findOne({ googleId })
      .select('+googleId')
      .exec();
  }
}
