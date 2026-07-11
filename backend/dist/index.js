"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCarDetails = formatCarDetails;
function formatCarDetails(car) {
    return `${car.year} ${car.make} ${car.model} - $${car.price}`;
}
