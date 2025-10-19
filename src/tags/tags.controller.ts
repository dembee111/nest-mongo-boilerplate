import { TagsService } from './providers/tags.service';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateTagDto } from './dtos/create-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}
  @Post()
  public createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.createTag(createTagDto);
  }
}
