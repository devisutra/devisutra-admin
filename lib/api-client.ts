const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

// Helper to make authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Unauthorized - clear token and redirect to login
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Admin Authentication API
export const adminAuthAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Check if user is admin
    if (!data.user?.isAdmin) {
      throw new Error('Access denied. Admin privileges required.');
    }
    
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }
    return data;
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
    return fetchWithAuth(`/api/admin/products${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => fetchWithAuth(`/api/admin/products/${id}`),
  
  create: (productData: any) =>
    fetchWithAuth('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),
  
  update: (id: string, productData: any) =>
    fetchWithAuth(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),
  
  delete: (id: string) =>
    fetchWithAuth(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),
};

// Orders API
export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return fetchWithAuth(`/api/admin/orders${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => fetchWithAuth(`/api/admin/orders/${id}`),
  
  updateStatus: (id: string, status: string) =>
    fetchWithAuth(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Customers API
export const customersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return fetchWithAuth(`/api/admin/customers${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => fetchWithAuth(`/api/admin/customers/${id}`),
  
  create: (customerData: any) =>
    fetchWithAuth('/api/admin/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),
  
  update: (id: string, customerData: any) =>
    fetchWithAuth(`/api/admin/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    }),
  
  delete: (id: string) =>
    fetchWithAuth(`/api/admin/customers/${id}`, {
      method: 'DELETE',
    }),
  
  updateStatus: (id: string, isActive: boolean) =>
    fetchWithAuth(`/api/admin/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => fetchWithAuth('/api/admin/dashboard'),
};

export default {
  auth: adminAuthAPI,
  dashboard: dashboardAPI,
  products: productsAPI,
  orders: ordersAPI,
  customers: customersAPI,
};
