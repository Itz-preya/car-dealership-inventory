import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ message: 'User registered successfully' });
});

export default app;
