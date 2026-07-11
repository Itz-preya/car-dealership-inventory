import request from 'supertest';
import app from '../app';

describe('Auth POST /api/auth/register', () => {
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
