import app from './app';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server is listening on port ${PORT}`);
  });
}

export interface Car {
  make: string;
  model: string;
  year: number;
  price: number;
}

export function formatCarDetails(car: Car): string {
  return `${car.year} ${car.make} ${car.model} - $${car.price}`;
}
