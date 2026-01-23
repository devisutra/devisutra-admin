"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  
  // Show error messages from URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized') {
      toast.error('Please login to access admin panel');
    } else if (error === 'not_admin') {
      toast.error('Access denied. Admin privileges required.');
    } else if (error === 'invalid_session') {
      toast.error('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Use adminAuthAPI from api-client
      const { adminAuthAPI } = await import('@/lib/api-client');
      const data = await adminAuthAPI.login(formData.email, formData.password);
      
      // Verify that token and user are stored
      const storedToken = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');
      
      if (!storedToken || !storedUser) {
        throw new Error('Failed to store authentication data');
      }
      
      toast.success("Login successful! Redirecting...");
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-brand-ivory">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-2 border-brand-gold">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-brown mb-2">Devi Sutra</h1>
            <p className="text-brand-text">Admin Panel Login</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-brand-brown mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition text-brand-text"
                placeholder=""
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-brand-brown mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition text-brand-text"
                placeholder=""
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-brown text-white py-3 rounded-lg font-semibold hover:bg-brand-brown/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-text">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}