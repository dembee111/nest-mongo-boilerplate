import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Module({
  providers: [
    // Redis Client provider
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = new Redis({
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: Number(process.env.REDIS_PORT) || 6379,
          //   password: process.env.REDIS_PASSWORD || undefined,
          db: Number(process.env.REDIS_DB) || 0,
          retryStrategy(times) {
            // холболт тасарвал 2 секунд тутамд дахин оролдоно
            return Math.min(times * 50, 2000);
          },
        });

        client.on('connect', () => console.log('✅ Redis connected'));
        client.on('error', (err) => console.error('❌ Redis error', err));

        return client;
      },
    },
    RedisService, // RedisService-г provider болгож бүртгэнэ
  ],
  exports: ['REDIS_CLIENT', RedisService], // гадагш экспортлоно
})
export class RedisModule {}
