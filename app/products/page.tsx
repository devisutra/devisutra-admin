"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Edit, Trash, Search } from "lucide-react";

interface ProductType {
  _id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: 0,
    stock: 0,
    description: "",
  });

  // Data Fetching
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      // Use API client with authentication
      const { productsAPI } = await import('@/lib/api-client');
      const data = await productsAPI.getAll();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setLoading(true);
    try {
      // Use API client with authentication
      const { productsAPI } = await import('@/lib/api-client');
      await productsAPI.update(editingProduct._id, formData);
      
      alert("Product updated successfully!");
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) return;

    try {
      // Use API client with authentication
      const { productsAPI } = await import('@/lib/api-client');
      await productsAPI.delete(productId);
      
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-brown">Products (DEVI SUTRA)</h1>
          <p className="text-brand-text text-sm mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/products/new"
          className="bg-brand-brown text-brand-ivory px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-gold hover:text-brand-brown transition text-white self-start md:self-auto"
        >
          <Plus size={20} /> Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-brand-gold/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text" size={20} />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-brand-gold/30 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>
      </div>

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
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Product Name</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Category</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Price</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Stock</th>
                  <th className="p-3 md:p-4 font-medium text-brand-brown">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-brand-gold/10 hover:bg-brand-gold/5 text-brand-text">
                    <td className="p-3 md:p-4 font-medium">{product.title}</td>
                    <td className="p-3 md:p-4">
                      <span className="px-3 py-1 bg-brand-gold/20 text-brand-brown rounded-full text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-brand-brown font-semibold">₹{product.price}</td>
                    <td className="p-3 md:p-4">
                      <span className={product.stock <= 10 ? "text-red-600 font-semibold" : ""}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-brand-text hover:text-brand-gold p-1"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.title)}
                        className="text-brand-text hover:text-red-600 p-1"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-brand-text">
                      {searchQuery ? "No products found matching your search" : "No products found. Start adding your collection!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-brand-brown mb-4">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-brand-gold/30 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-brown text-white py-2 rounded-lg hover:bg-brand-gold hover:text-brand-brown transition"
                >
                  {loading ? "Updating..." : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
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