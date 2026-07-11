import request from 'supertest';
import app from '../app';
import prisma from '../prisma';

describe('Auth POST /api/auth/register', () => {
  beforeEach(async () => {
    // Clean up test user if it exists
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });
  });

  afterAll(async () => {
    // Disconnect prisma client to avoid open handles
    await prisma.$disconnect();
  });

  it('should return a 201 status code on successful registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(response.status).toBe(201);
  });
});
