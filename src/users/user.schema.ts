import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  // Note: id is not needed because _id is added by default by MongoDb
  @Prop({
    type: String,
    isRequired: false,
  })
  firstName: string;

  @Prop({
    type: String,
    isRequired: false,
  })
  lastName?: string;

  @Prop({
    type: String,
    isRequired: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    isRequired: true,
    select: false,
  })
  @Exclude()
  password: string;

  @Prop({
    type: String,
    required: false,
    sparse: true,
    select: false,
  })
  googleId?: string;

  @Prop({
    type: String,
    required: false,
    sparse: true,
    select: false,
  })
  facebookId?: string;

  @Prop({
    type: String,
    validate: {
      validator: (v: string) => /^[89]\d{7}$/.test(v),
      message: (props) =>
        `${props.value} is not a valid Mongolian phone number!`,
    },
    required: false,
    unique: true,
  })
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
