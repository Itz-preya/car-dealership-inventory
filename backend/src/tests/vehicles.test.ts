import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

describe('Vehicles API', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  let token: string;

  beforeAll(() => {
    // Generate a valid JWT token for testing
    token = jwt.sign(
      { id: 'test-user-id', role: 'USER' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    // Clean up vehicles created during testing
    await prisma.vehicle.deleteMany();
  });

  afterAll(async () => {
    // Disconnect prisma client to avoid open handles
    await prisma.$disconnect();
  });

  describe('POST /api/vehicles', () => {
    it('should create a new vehicle and return 201', async () => {
      const vehicleData = {
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        price: 22000,
        status: 'AVAILABLE',
      };

      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send(vehicleData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.make).toBe('Honda');
      expect(response.body.model).toBe('Civic');
      expect(response.body.year).toBe(2021);
      expect(response.body.price).toBe(22000);
      expect(response.body.status).toBe('AVAILABLE');
    });

    it('should return a 401 status when request is made without a valid Bearer token', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          price: 22000,
        });

      expect(response.status).toBe(401);
    });

    it('should return a 400 status when required fields like make or model are missing', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          year: 2021,
          price: 22000,
        });

      expect(response.status).toBe(400);
    });

    it('should return a 400 status if numeric values like year or price have invalid data types or negative values', async () => {
      // Test invalid data type for price
      const responseInvalidType = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          price: 'not-a-number',
        });

      expect(responseInvalidType.status).toBe(400);

      // Test negative price
      const responseNegativePrice = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          price: -100,
        });

      expect(responseNegativePrice.status).toBe(400);

      // Test negative year
      const responseNegativeYear = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          make: 'Honda',
          model: 'Civic',
          year: -2021,
          price: 22000,
        });

      expect(responseNegativeYear.status).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return a list of all vehicles and status 200', async () => {
      // Seed a couple of vehicles first so there is data to return
      await prisma.vehicle.createMany({
        data: [
          {
            make: 'Toyota',
            model: 'Corolla',
            year: 2019,
            price: 18000,
          },
          {
            make: 'Honda',
            model: 'Civic',
            year: 2021,
            price: 22000,
          },
        ],
      });

      const response = await request(app)
        .get('/api/vehicles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].make).toBe('Toyota');
      expect(response.body[1].make).toBe('Honda');
    });

    it('should return a 200 status code and an empty array when filtering by a status that does not exist', async () => {
      // Seed a vehicle
      await prisma.vehicle.create({
        data: {
          make: 'Toyota',
          model: 'Corolla',
          year: 2019,
          price: 18000,
          status: 'AVAILABLE',
        },
      });

      const response = await request(app)
        .get('/api/vehicles?status=NON_EXISTENT_STATUS');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('should return 200 and search results filtered by make, minPrice, and maxPrice', async () => {
      // Seed a few vehicles
      await prisma.vehicle.createMany({
        data: [
          {
            make: 'Toyota',
            model: 'Corolla',
            year: 2019,
            price: 18000,
            status: 'AVAILABLE',
          },
          {
            make: 'Toyota',
            model: 'Camry',
            year: 2021,
            price: 25000,
            status: 'AVAILABLE',
          },
          {
            make: 'Honda',
            model: 'Civic',
            year: 2021,
            price: 22000,
            status: 'AVAILABLE',
          },
          {
            make: 'Toyota',
            model: 'Yaris',
            year: 2018,
            price: 8000,
            status: 'AVAILABLE',
          },
        ],
      });

      const response = await request(app)
        .get('/api/vehicles/search?make=Toyota&minPrice=10000&maxPrice=30000');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      
      const models = response.body.map((v: any) => v.model);
      expect(models).toContain('Corolla');
      expect(models).toContain('Camry');
      expect(models).not.toContain('Civic');
      expect(models).not.toContain('Yaris');
    });
  });
});
