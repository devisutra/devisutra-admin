"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle
} from "lucide-react";

export const dynamic = 'force-dynamic';

interface DashboardStats {
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
  recentOrders: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    todaySales: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use API client with authentication
      const { dashboardAPI } = await import('@/lib/api-client');
      const dashboardData = await dashboardAPI.getStats();
      
      const orders = dashboardData.recentOrders || [];
      const products = dashboardData.products || [];

      // Set stats directly from API response
      setStats({
        totalSales: dashboardData.totalSales || 0,
        todaySales: dashboardData.todaySales || 0,
        pendingOrders: dashboardData.pendingOrders || 0,
        processingOrders: dashboardData.processingOrders || 0,
        shippedOrders: dashboardData.shippedOrders || 0,
        deliveredOrders: dashboardData.deliveredOrders || 0,
        activeProducts: dashboardData.activeProducts || 0,
        lowStockProducts: dashboardData.lowStockProducts || 0,
        totalCustomers: dashboardData.totalCustomers || 0,
        totalOrders: dashboardData.totalOrders || 0,
        recentOrders: dashboardData.recentOrders || [],
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-brand-brown">Dashboard Overview</h2>
        <p className="text-brand-text mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-brand-text text-xs md:text-sm">Total Sales</h3>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-brand-brown">
                ₹{stats.totalSales.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Today: ₹{stats.todaySales.toLocaleString()}
              </p>
            </div>
            <div className="bg-brand-gold/20 p-3 rounded-full">
              <IndianRupee className="text-brand-brown" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-brand-text text-xs md:text-sm">Total Orders</h3>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-brand-brown">{stats.totalOrders}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.pendingOrders} Pending
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-brand-text text-xs md:text-sm">Active Products</h3>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-brand-brown">{stats.activeProducts}</p>
              {stats.lowStockProducts > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {stats.lowStockProducts} Low Stock
                </p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-brand-text text-xs md:text-sm">Total Customers</h3>
              <p className="text-2xl md:text-3xl font-bold mt-2 text-brand-brown">{stats.totalCustomers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20">
        <h3 className="text-lg font-semibold text-brand-brown mb-4">Order Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="mx-auto mb-2 text-yellow-600" size={24} />
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
            <p className="text-sm text-gray-600">Processing</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Package className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-purple-600">{stats.shippedOrders}</p>
            <p className="text-sm text-gray-600">Shipped</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
            <p className="text-sm text-gray-600">Delivered</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20">
        <h3 className="text-lg font-semibold text-brand-brown mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-brown/5 border-b-2 border-brand-gold/30">
              <tr>
                <th className="p-3 font-medium text-brand-brown">Order ID</th>
                <th className="p-3 font-medium text-brand-brown">Customer</th>
                <th className="p-3 font-medium text-brand-brown">Amount</th>
                <th className="p-3 font-medium text-brand-brown">Status</th>
                <th className="p-3 font-medium text-brand-brown">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order._id} className="border-b border-brand-gold/10 hover:bg-brand-gold/5">
                  <td className="p-3 text-brand-text">#{order._id.slice(-6)}</td>
                  <td className="p-3 text-brand-text">{order.customerDetails?.fullName || "N/A"}</td>
                  <td className="p-3 text-brand-brown font-semibold">₹{order.totalAmount}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "Processing" ? "bg-blue-100 text-blue-800" :
                      order.status === "Shipped" ? "bg-purple-100 text-purple-800" :
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-brand-text text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-brand-text">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 p-4 md:p-6 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Low Stock Alert</h3>
              <p className="text-orange-700 mt-1">
                {stats.lowStockProducts} product(s) are running low on stock. Please restock soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}