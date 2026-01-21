"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Loader2, Filter, X } from "lucide-react";

interface OrderType {
  _id: string;
  customerDetails: {
    fullName: string;
    phone: string;
    city: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: { title: string; quantity: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Orders Fetch Karna
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Use API client with authentication
        const { ordersAPI } = await import('@/lib/api-client');
        const data = await ordersAPI.getAll();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => new Date(order.createdAt) >= fromDate);
    }

    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.createdAt) <= toDate);
    }

    setFilteredOrders(filtered);
  }, [statusFilter, dateFromFilter, dateToFilter, orders]);

  // Clear filters
  const clearFilters = () => {
    setStatusFilter("All");
    setDateFromFilter("");
    setDateToFilter("");
  };

  // Status Color Helper
  const getStatusColor = (status: string) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-800";
    if (status === "Processing") return "bg-blue-100 text-blue-800";
    if (status === "Shipped") return "bg-purple-100 text-purple-800";
    if (status === "Delivered") return "bg-green-100 text-green-800";
    if (status === "Cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  // Status Update Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Use API client with authentication
      const { ordersAPI } = await import('@/lib/api-client');
      await ordersAPI.updateStatus(orderId, newStatus);
      
      // UI mein turant update dikhane ke liye local state update karein
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert("Status Updated!");
    } catch (error: any) {
      console.error("Status Not Updated", error);
      alert(error.message || "Failed to update status");
    }
  };

  // Calculate active filters count
  const activeFiltersCount = 
    (statusFilter !== "All" ? 1 : 0) + 
    (dateFromFilter ? 1 : 0) + 
    (dateToFilter ? 1 : 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-brown">
            Order Management
          </h1>
          <p className="text-brand-text text-sm mt-1">
            {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-brand-brown text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-gold hover:text-brand-brown transition self-start md:self-auto relative"
        >
          <Filter size={20} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-brand-gold/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-brand-brown">Filter Orders</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X size={16} /> Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-brand-text mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center mt-10">
          <Loader2 className="animate-spin text-brand-gold" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border-2 border-brand-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-brown/5 border-b-2 border-brand-gold/30">
                <tr>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Order ID</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Customer</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Items</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Total</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Status</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-brand-gold/10 hover:bg-brand-gold/5">
                    <td className="p-3 md:p-4 text-brand-text font-mono text-xs">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="font-medium text-brand-text">
                        {order.customerDetails.fullName}
                      </div>
                      <div className="text-xs text-brand-text/60">
                        {order.customerDetails.city}
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-brand-text text-xs">
                      {order.orderItems.map((item, index) => (
                        <div key={index}>
                          {item.quantity}x {item.title}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 md:p-4 font-semibold text-brand-brown">₹{order.totalAmount}</td>
                    <td className="p-3 md:p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-none outline-none cursor-pointer ${getStatusColor(
                          order.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 md:p-4 text-brand-text text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-brand-text">
                      {activeFiltersCount > 0 
                        ? "No orders found matching your filters" 
                        : "No orders yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
