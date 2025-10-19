import { CreateTagDto } from './../dtos/create-tag.dto';
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Tag } from '../tag.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TagsService {
  constructor(
    /**
     * Inject tagsModel
     */
    @InjectModel(Tag.name)
    private readonly tagsModel: Model<Tag>,
  ) {}

  public async findMultipleTags(tagIds: string[]) {
    try {
      const results = await this.tagsModel
        .find({
          _id: { $in: tagIds },
        })
        .exec();

      return results;
    } catch (error) {
      throw new RequestTimeoutException(
        'Unable to process your request at the moment. Please try later.',
        {
          description: 'Error connecting to the database while fetching tags',
        },
      );
    }
  }

  public async createTag(createTagDto: CreateTagDto) {
    const newTag = new this.tagsModel(createTagDto);
    return await newTag.save();
  }
}
