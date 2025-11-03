import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async set(
    key: string,
    value: any,
    mode?: 'EX' | 'PX',
    duration?: number,
  ): Promise<string> {
    const serialized =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    // аргументуудыг динамикаар угсрах
    const args: [string, string, ...Array<string | number>] = [key, serialized];

    if (mode && duration) {
      args.push(mode, duration);
    }

    // type-safe хэлбэр
    return (this.client as any).set(...args);
  }

  async get<T = string>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data as T;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
