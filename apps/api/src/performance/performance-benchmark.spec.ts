import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../providers/prisma-client.provider';

describe('Performance Benchmarks', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Get auth token for authenticated requests
    // This would typically come from a test user setup
    authToken = 'test-token'; // Replace with actual token generation
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Therapist List Endpoint Performance', () => {
    it('should respond to therapist list query in under 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/therapists/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20, offset: 0 });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500); // Should respond in under 500ms
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/therapists/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 50, offset: 100 });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(800); // Pagination should be efficient
    });

    it('should cache repeated queries', async () => {
      // First request
      const firstStart = Date.now();
      await request(app.getHttpServer())
        .get('/therapists/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20, offset: 0 });
      const firstDuration = Date.now() - firstStart;

      // Second request (should be cached)
      const secondStart = Date.now();
      await request(app.getHttpServer())
        .get('/therapists/list')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 20, offset: 0 });
      const secondDuration = Date.now() - secondStart;

      // Cached request should be significantly faster
      expect(secondDuration).toBeLessThan(firstDuration * 0.5);
    });
  });

  describe('Search Endpoint Performance', () => {
    it('should handle search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ q: 'anxiety', type: 'therapist' });

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(600);
    });
  });

  describe('Database Query Performance', () => {
    it('should fetch therapist list with optimized queries', async () => {
      const startTime = Date.now();
      
      // This would test the actual service method
      // For now, we'll test the endpoint
      const response = await request(app.getHttpServer())
        .get('/therapists/list')
        .set('Authorization', `Bearer ${authToken}`);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app.getHttpServer())
          .get('/therapists/list')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ limit: 20, offset: 0 })
      );

      const responses = await Promise.all(promises);
      const totalDuration = Date.now() - startTime;
      const avgDuration = totalDuration / concurrentRequests;

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Average response time should be reasonable
      expect(avgDuration).toBeLessThan(1000);
    });
  });
});

