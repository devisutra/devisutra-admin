import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data.data || response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    throw new Error(message);
  }
);

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

// Admin Authentication API
export const adminAuthAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      const data = response.data;
      
      // Check if user is admin
      if (!data.user?.isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    
    const query = queryParams.toString();
    return axiosInstance.get(`/api/admin/products${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => axiosInstance.get(`/api/admin/products/${id}`),
  
  create: (productData: any) => axiosInstance.post('/api/admin/products', productData),
  
  update: (id: string, productData: any) => 
    axiosInstance.put(`/api/admin/products/${id}`, productData),
  
  delete: (id: string) => axiosInstance.delete(`/api/admin/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return axiosInstance.get(`/api/admin/orders${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => axiosInstance.get(`/api/admin/orders/${id}`),
  
  updateStatus: (id: string, status: string) =>
    axiosInstance.put(`/api/admin/orders/${id}/status`, { status }),
};

// Customers API
export const customersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return axiosInstance.get(`/api/admin/customers${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => axiosInstance.get(`/api/admin/customers/${id}`),
  
  create: (customerData: any) => axiosInstance.post('/api/admin/customers', customerData),
  
  update: (id: string, customerData: any) => 
    axiosInstance.put(`/api/admin/customers/${id}`, customerData),
  
  delete: (id: string) => axiosInstance.delete(`/api/admin/customers/${id}`),
  
  updateStatus: (id: string, isActive: boolean) =>
    axiosInstance.patch(`/api/admin/customers/${id}/status`, { isActive }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => axiosInstance.get('/api/admin/dashboard'),
};

export default {
  auth: adminAuthAPI,
  dashboard: dashboardAPI,
  products: productsAPI,
  orders: ordersAPI,
  customers: customersAPI,
};
