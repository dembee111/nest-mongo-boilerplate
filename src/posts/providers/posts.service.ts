import {
  Injectable,
  BadRequestException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Model } from 'mongoose';
import { Post } from '../post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-post.dto';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { CreatePostProvider } from './create-post.provider';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

@Injectable()
export class PostsService {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,
    /**
     * Inject postModel
     */
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,

    private readonly tagsService: TagsService,

    private readonly paginationProvider: PaginationProvider,

    /**
     * Inject createPostProvider
     */
    private readonly createPostProvider: CreatePostProvider,
  ) {}

  /**
   * Creating new posts
   */
  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    return await this.createPostProvider.create(createPostDto, user);
  }

  public async findAll(postQuery: GetPostsDto) {
    const filter: Record<string, any> = {};

    if (postQuery.startDate || postQuery.endDate) {
      filter.createdAt = {};
      if (postQuery.startDate)
        filter.createdAt.$gte = new Date(postQuery.startDate);
      if (postQuery.endDate)
        filter.createdAt.$lte = new Date(postQuery.endDate);
    }

    return this.paginationProvider.paginateQuery(
      postQuery,
      this.postModel,
      filter,
      {},
      { createdAt: -1 },
      'author', // populate field
    );
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags;
    let post;
    console.log('haha');
    // 🔹 1. Тагуудыг шалгах
    try {
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags);
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Please try later.',
        {
          description: 'Error connecting to the database while fetching tags',
        },
      );
    }

    if (!tags || tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException(
        'Please check your tag IDs and ensure they are correct.',
      );
    }

    // 🔹 2. Постыг хайх
    try {
      post = await this.postModel.findById(patchPostDto.id).exec();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Please try later.',
        {
          description: 'Error connecting to the database while fetching post',
        },
      );
    }

    if (!post) {
      throw new BadRequestException('The post ID does not exist.');
    }

    // 🔹 3. Полинуудыг шинэчлэх
    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;

    // 🔹 4. Тагуудыг оноох
    post.tags = tags.map((tag) => tag._id);

    // 🔹 5. Хадгалах
    try {
      await post.save();
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Please try later.',
        {
          description: 'Error connecting to the database while saving post',
        },
      );
    }

    return post;
  }
}
