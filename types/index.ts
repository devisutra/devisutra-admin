// Product types
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Order types
export interface Order {
  _id: string;
  userId?: string;
  items: OrderItem[];
  customerDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

// Customer types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  totalOrders: number;
  recentOrders: Order[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
