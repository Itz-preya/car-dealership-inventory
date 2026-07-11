import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { authenticateJWT } from './middleware/auth';

const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/vehicles', authenticateJWT, async (req, res) => {
  try {
    const { make, model, year, price, status } = req.body;

    if (!make || !model || year === undefined || price === undefined) {
      return res.status(400).json({ error: 'Missing required vehicle fields' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        year: Number(year),
        price: Number(price),
        status: status || 'AVAILABLE',
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
