"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus, Edit, Trash, Ban, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      // Use API client with authentication
      const { customersAPI } = await import('@/lib/api-client');
      const data = await customersAPI.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use API client with authentication
      const { customersAPI } = await import('@/lib/api-client');
      
      if (editingCustomer) {
        await customersAPI.update(editingCustomer._id, formData);
        alert("Customer updated!");
      } else {
        await customersAPI.create(formData);
        alert("Customer added!");
      }
      
      setShowAddModal(false);
      setEditingCustomer(null);
      setFormData({ fullName: "", email: "", phone: "", password: "" });
      fetchCustomers();
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      password: "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      // Use API client with authentication
      const { customersAPI } = await import('@/lib/api-client');
      await customersAPI.delete(customerId);
      
      alert("Customer deleted!");
      fetchCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      alert(error.message || "Failed to delete customer");
    }
  };

  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      // Use API client with authentication
      const { customersAPI } = await import('@/lib/api-client');
      await customersAPI.updateStatus(customerId, !currentStatus);
      
      alert(`Customer ${!currentStatus ? "activated" : "suspended"}!`);
      fetchCustomers();
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(error.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-brown">Customer Management</h1>
          <p className="text-brand-text text-sm mt-1">Manage your customer base</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ fullName: "", email: "", phone: "", password: "" });
            setShowAddModal(true);
          }}
          className="bg-brand-brown text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-gold hover:text-brand-brown transition self-start md:self-auto"
        >
          <UserPlus size={20} /> Add Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-brand-gold/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brand-gold/30 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Customers List */}
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
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Name</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Email</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Phone</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Status</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Joined</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-brand-gold/10 hover:bg-brand-gold/5">
                    <td className="p-3 md:p-4 font-medium text-brand-text">{customer.fullName}</td>
                    <td className="p-3 md:p-4 text-brand-text">{customer.email}</td>
                    <td className="p-3 md:p-4 text-brand-text">{customer.phone}</td>
                    <td className="p-3 md:p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          customer.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-brand-text text-xs">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-brand-text hover:text-brand-gold p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                          className={`p-1 ${
                            customer.isActive
                              ? "text-brand-text hover:text-red-600"
                              : "text-brand-text hover:text-green-600"
                          }`}
                          title={customer.isActive ? "Suspend" : "Activate"}
                        >
                          {customer.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="text-brand-text hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-brand-text">
                      {searchQuery ? "No customers found matching your search" : "No customers yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-brand-brown mb-4">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              {!editingCustomer && (
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!editingCustomer}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-brown text-white py-2 rounded-lg hover:bg-brand-gold hover:text-brand-brown transition"
                >
                  {loading ? "Saving..." : editingCustomer ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCustomer(null);
                    setFormData({ fullName: "", email: "", phone: "", password: "" });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
