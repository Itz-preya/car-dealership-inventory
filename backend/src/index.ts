export interface Car {
  make: string;
  model: string;
  year: number;
  price: number;
}

export function formatCarDetails(car: Car): string {
  return `${car.year} ${car.make} ${car.model} - $${car.price}`;
}
