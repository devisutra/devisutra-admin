"use client";

import Link from "next/link";
import { Package, LayoutDashboard, ShoppingCart, Users, Menu, X, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status from localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_token');
        const userStr = localStorage.getItem('admin_user');
        
        // If on login page, just check if already authenticated
        if (pathname === '/login') {
          if (token && userStr) {
            const userData = JSON.parse(userStr);
            if (userData.isAdmin) {
              // Already authenticated, redirect to dashboard
              router.push('/dashboard');
              return;
            }
          }
          setLoading(false);
          return;
        }
        
        // For other pages, check authentication
        if (!token || !userStr) {
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/login?error=unauthorized');
          return;
        }
        
        // Parse and validate user data
        const userData = JSON.parse(userStr);
        if (!userData.isAdmin) {
          // Not an admin user
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/login?error=not_admin');
          return;
        }
        
        // Valid admin authentication
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAuthenticated(false);
        setLoading(false);
        if (pathname !== '/login') {
          router.push('/login?error=invalid_session');
        }
      }
    };
    
    checkAuth();
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <html lang="en">
        <body>
          <div className="flex items-center justify-center h-screen bg-brand-ivory">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mx-auto"></div>
              <p className="mt-4 text-brand-brown">Verifying access...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // If on login page, just render the children without sidebar
  if (pathname === '/login') {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  // Don't render admin content if not authenticated
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body></body>
      </html>
    );
  }

  const navLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/reviews", icon: MessageSquare, label: "Reviews" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-brand-ivory overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b-2 border-brand-gold">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-lg font-bold text-brand-brown">Devi Sutra Admin</h1>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-brand-brown hover:text-brand-gold"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar - Desktop & Mobile */}
          <aside
            className={`${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:relative z-50 w-64 bg-white shadow-md border-r-2 border-brand-gold h-full transition-transform duration-300`}
          >
            <div className="p-6 border-b border-brand-gold/20 hidden md:block">
              <h1 className="text-2xl font-bold text-brand-brown">Devi Sutra Admin</h1>
            </div>
            <nav className="mt-6 md:mt-6 px-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? "bg-brand-gold text-brand-brown font-semibold"
                        : "text-brand-text hover:bg-brand-gold/10 hover:text-brand-brown"
                    }`}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}