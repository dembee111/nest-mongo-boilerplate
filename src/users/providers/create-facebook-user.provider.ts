import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { FacebookUser } from '../interfaces/facebook-user.interface';

@Injectable()
export class CreateFacebookUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  public async createFacebookUser(facebookUser: FacebookUser) {
    try {
      // Mongoose create() нь автоматаар save хийдэг тул save() хэрэггүй
      const user = await this.userModel.create({
        firstName: facebookUser.firstName,
        lastName: facebookUser.lastName,
        facebookId: facebookUser.facebookId,
        email: facebookUser.email,
      });

      return user;
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Could not create a new user',
      });
    }
  }
}
