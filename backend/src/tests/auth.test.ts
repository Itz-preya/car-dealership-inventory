import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
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

  describe('POST /api/auth/register', () => {
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

  describe('POST /api/auth/login', () => {
    it('should return a 200 status code and a JWT token on successful login', async () => {
      // Seed the user in the database first
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return a 401 status when provided a registered email but an incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return a 400 status when the email or password field is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });

    it('should return a 401 status when attempting to log in with a non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });
  });
});
