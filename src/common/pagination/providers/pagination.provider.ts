import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Model, PopulateOptions } from 'mongoose';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  /**
   * Pagination function for Mongoose models
   * @param paginationQuery Pagination params
   * @param model Mongoose model
   * @param filter MongoDB query filter
   * @param projection Fields to return
   * @param sort Sorting order
   * @param populate Populate fields
   */
  public async paginateQuery<T>(
    paginationQuery: PaginationQueryDto,
    model: Model<T>,
    filter: Record<string, any> = {},
    projection: Record<string, any> = {},
    sort: Record<string, any> = { _id: -1 },
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
  ): Promise<Paginated<T>> {
    const page = Math.max(1, paginationQuery.page || 1);
    const limit = Math.max(1, paginationQuery.limit || 10);
    const skip = (page - 1) * limit;

    // Build the query
    let query = model
      .find(filter, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Apply populate if provided
    if (populate) {
      const populateArray = Array.isArray(populate) ? populate : [populate];
      populateArray.forEach((p) => {
        if (typeof p === 'string') {
          query.populate(p);
        } else {
          query.populate(p as PopulateOptions);
        }
      });
    }

    // Execute the query
    const [results, totalItems] = await Promise.all([
      query.exec(),
      model.countDocuments(filter).exec(),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page < totalPages ? page + 1 : page;
    const previousPage = page > 1 ? page - 1 : page;

    // Build URLs dynamically
    const baseURL = `${this.request.protocol}://${this.request.headers.host}/`;
    const newUrl = new URL(this.request.url, baseURL);

    const finalResponse: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        last: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        current: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${page}`,
        next: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
        previous: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`,
      },
    };

    return finalResponse;
  }
}
