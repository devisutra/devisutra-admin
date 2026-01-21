"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Bags", // Default
    stock: "",
    imageUrl: "", // Temporary for Phase 1
  });

  // Categories jo aapne maange the
  const categories = [
    "Bags",
    "Thaila",
    "Rubber",
    "Clothes",
    "Blouse",
    "Accessories",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('admin_token');
      
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          images: [formData.imageUrl],
        }),
      });

      if (res.ok) {
        router.push("/products"); // Success ke baad list page par wapas
        router.refresh();
      } else {
        alert("Something went wrong!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products" className="text-brand-text hover:text-brand-brown">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-brand-brown">Add New Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border-2 border-brand-gold/20 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">Product Title</label>
          <input
            name="title"
            required
            placeholder="e.g. Handmade Cotton Thaila"
            className="w-full border-2 border-brand-gold/30 p-2 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-brand-text"
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Product details..."
            className="w-full border-2 border-brand-gold/30 p-2 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-brand-text"
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-1">Price (₹)</label>
            <input
              name="price"
              type="number"
              required
              placeholder="0.00"
              className="w-full border-2 border-brand-gold/30 p-2 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-brand-text"
              onChange={handleChange}
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-1">Stock Quantity</label>
            <input
              name="stock"
              type="number"
              required
              placeholder="0"
              className="w-full border-2 border-brand-gold/30 p-2 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none text-brand-text"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-brand-brown mb-1">Category</label>
            <select
              name="category"
              className="w-full border-2 border-brand-gold/30 p-2 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none bg-white text-brand-text"
              onChange={handleChange}
              value={formData.category}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-brand-brown mb-2">Product Image</label>
          
          <CldUploadWidget 
            uploadPreset="desidhaaga_preset" // Yahan Step 1 wala Preset name dalein
            onSuccess={(result: any) => {
              // Jab upload ho jaye, toh URL set karein
              setFormData((prev) => ({ 
                ...prev, 
                imageUrl: result.info.secure_url 
              }));
            }}
          >
            {({ open }) => {
              return (
                <div 
                  onClick={() => open()}
                  className="relative cursor-pointer hover:opacity-70 transition border-dashed border-2 border-brand-gold p-10 flex flex-col justify-center items-center gap-4 text-brand-text bg-brand-ivory rounded-lg h-60"
                >
                  {formData.imageUrl ? (
                    // Agar image upload ho gayi hai, toh preview dikhayein
                    <div className="relative w-full h-full">
                      <Image 
                        src={formData.imageUrl} 
                        alt="Product" 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    // Agar nahi hui hai, toh upload button dikhayein
                    <>
                      <ImageIcon size={40} className="text-brand-gold" />
                      <div className="text-sm font-semibold text-brand-brown">Click to Upload Image</div>
                    </>
                  )}
                </div>
              );
            }}
          </CldUploadWidget>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-brown text-brand-ivory py-3 rounded-lg font-semibold hover:bg-brand-gold hover:text-brand-brown transition flex justify-center items-center gap-2 text-white"
        >
          {loading ? "Saving..." : <><Save size={20} /> Save Product</>}
        </button>
      </form>
    </div>
  );
}