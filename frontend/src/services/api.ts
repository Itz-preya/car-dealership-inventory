import axios from 'axios';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: string;
  quantity: number;
}

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  async register(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
};

// Vehicle services
export const vehicleService = {
  async getAll(status?: string): Promise<Vehicle[]> {
    const response = await api.get('/vehicles', { params: { status } });
    return response.data;
  },
  async search(params: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Vehicle[]> {
    const response = await api.get('/vehicles/search', { params });
    return response.data;
  },
  async create(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  async update(id: string, data: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
  async purchase(id: string): Promise<Vehicle> {
    const response = await api.post(`/vehicles/${id}/purchase`);
    return response.data;
  },
  async restock(id: string, quantityToAdd: number): Promise<Vehicle> {
    const response = await api.post(`/vehicles/${id}/restock`, { quantityToAdd });
    return response.data;
  },
};

export default api;
