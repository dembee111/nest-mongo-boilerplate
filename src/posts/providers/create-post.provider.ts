import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { UsersService } from 'src/users/providers/users.service';
import { Post } from '../post.schema';
import { TagsService } from 'src/tags/providers/tags.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CreatePostProvider {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,
    /**
     * Inject TagsService
     */
    private readonly tagsService: TagsService,

    /**
     * Inject postModel
     */
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    console.log('🚀 ~ CreatePostProvider ~ create ~ user:', user);
    let author = undefined;
    let tags = undefined;

    try {
      // Author-г хэрэглэгчийн ID-аар хайна
      author = await this.usersService.findOneById(user.sub);

      // Тагуудыг олно
      tags = await this.tagsService.findMultipleTags(createPostDto.tags);
    } catch (error) {
      throw new ConflictException(error);
    }

    if (!tags || createPostDto.tags.length !== tags.length) {
      throw new BadRequestException('Please check your tag IDs');
    }

    // Mongoose загвар ашиглан шинэ пост үүсгэх
    const post = new this.postModel({
      ...createPostDto,
      author: author._id, // Reference (ObjectId)
      tags: tags.map((t) => t._id), // Reference массив
    });

    try {
      const savedPost = await post.save();
      // author, tags талбаруудыг populate хийн буцаах
      return await savedPost.populate(['author', 'tags']);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Post slug must be unique');
      }
      throw new ConflictException('Failed to save post', {
        description: error.message,
      });
    }
  }
}
