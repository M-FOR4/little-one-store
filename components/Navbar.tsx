"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "المجموعة" },
    { href: "/about", label: "قصتنا" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/icons/logo.svg" alt="Little One" className="h-12 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold transition-colors ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions (Search + Cart) */}
          <div className="flex items-center gap-4">
            
            {/* Search Bar */}
            <div className="relative flex items-center">
              <div 
                className={`flex items-center transition-all duration-300 overflow-hidden ${
                  searchOpen ? "w-60 md:w-80 opacity-100" : "w-0 opacity-0"
                }`}
              >
                <form onSubmit={handleSearch} className="w-full relative ml-2">
                  <input 
                    type="text" 
                    placeholder="ابحثي عن منتج..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </form>
              </div>
              
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-foreground hover:text-primary transition-colors flex items-center justify-center rounded-full"
                aria-label="البحث"
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            </div>

            <Link
              href="/cart"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <div className="relative p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="القائمة"
            >
              {mobileOpen ? (
                <X size={24} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-base font-bold py-2 ${
                pathname === link.href ? "text-primary" : "text-foreground"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
