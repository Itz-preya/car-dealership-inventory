"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe('formatCarDetails', () => {
    it('should format car details correctly', () => {
        const car = {
            make: 'Toyota',
            model: 'Corolla',
            year: 2020,
            price: 20000,
        };
        expect((0, index_1.formatCarDetails)(car)).toBe('2020 Toyota Corolla - $20000');
    });
});
