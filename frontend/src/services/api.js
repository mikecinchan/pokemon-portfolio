import axios from 'axios';
import { getCurrentUser } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication headers to all requests
api.interceptors.request.use(
  async (config) => {
    const user = getCurrentUser();
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-user-id'] = user.uid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Investments API
export const investmentsAPI = {
  // Get all investments
  getAll: async () => {
    const response = await api.get('/investments');
    return response.data;
  },

  // Get investment by ID
  getById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  // Create new investment
  create: async (data) => {
    const response = await api.post('/investments', data);
    return response.data;
  },

  // Update investment
  update: async (id, data) => {
    const response = await api.put(`/investments/${id}`, data);
    return response.data;
  },

  // Delete investment
  delete: async (id) => {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  },
};

// Prices API
export const pricesAPI = {
  // Get token price by ticker
  getByTicker: async (ticker) => {
    const response = await api.get(`/prices/${ticker}`);
    return response.data;
  },

  // Get token price by address
  getByAddress: async (chainId, address) => {
    const response = await api.get(`/prices/${chainId}/${address}`);
    return response.data;
  },
};

// Pokemon API
export const pokemonAPI = {
  // Get all Pokemon sorted by weight
  getAll: async () => {
    const response = await api.get('/pokemon');
    return response.data;
  },

  // Get Pokemon for portfolio value
  getForPortfolio: async (totalValue) => {
    const response = await api.get(`/pokemon/for-portfolio?totalValue=${totalValue}`);
    return response.data;
  },

  // Get Pokemon by level
  getByLevel: async (level) => {
    const response = await api.get(`/pokemon/level/${level}`);
    return response.data;
  },

  // Get Pokemon by ID or name
  getById: async (identifier) => {
    const response = await api.get(`/pokemon/${identifier}`);
    return response.data;
  },
};

export default api;
