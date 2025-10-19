import { Tag, TagSchema } from './tag.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsController } from './tags.controller';
import { TagsService } from './providers/tags.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Tag.name,
        schema: TagSchema,
      },
    ]),
  ],
  exports: [TagsService],
})
export class TagsModule {}
