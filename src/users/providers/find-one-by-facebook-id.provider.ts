import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user.schema';

@Injectable()
export class FindOneByFacebookIdProvider {
  constructor(
    /**
     * Inject Mongoose userModel
     */
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  public async findOneByFacebookId(facebookId: string) {
    return await this.userModel
      .findOne({ facebookId })
      .select('+facebookId')
      .exec();
  }
}
