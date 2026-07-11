import { formatCarDetails, Car } from '../index';

describe('formatCarDetails', () => {
  it('should format car details correctly', () => {
    const car: Car = {
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      price: 20000,
    };
    expect(formatCarDetails(car)).toBe('2020 Toyota Corolla - $20000');
  });
});
