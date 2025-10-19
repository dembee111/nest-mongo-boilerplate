import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema, Post } from './post.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './providers/posts.service';
import { UsersModule } from 'src/users/users.module';
import { TagsModule } from 'src/tags/tags.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    UsersModule,
    TagsModule,
    PaginationModule,
  ],
})
export class PostsModule {}
