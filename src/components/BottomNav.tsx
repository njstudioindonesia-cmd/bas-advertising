"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Bike, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, isLoaded } = useCart();

  // Sembunyikan bottom navigation pada area portal kerja (Admin, Vendor, Driver) dan Invoice cetak
  if (
    pathname?.startsWith("/urang-dalam-bas-adv") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/vendor") ||
    pathname?.startsWith("/driver") ||
    pathname?.startsWith("/invoice")
  ) {
    return null;
  }

  // Public customer-only mobile navigation tabs ala Gojek/Astro
  const navItems = [
    { label: "Beranda", icon: Home, href: "/" },
    { label: "Katalog", icon: LayoutGrid, href: "/produk" },
    { label: "Lacak", icon: Bike, href: "/lacak" },
    { label: "Chat", icon: MessageCircle, href: "/hubungi" },
    { 
      label: "Keranjang", 
      icon: ShoppingCart, 
      href: "/keranjang",
      badge: isLoaded && totalItems > 0 ? (totalItems > 99 ? "99+" : totalItems) : null
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)" }}
    >
      <div className="flex justify-around items-center h-14 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : (pathname === item.href || pathname?.startsWith(item.href + "/"));
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 active:scale-90 ${
                isActive ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {/* Active Indicator Bar on Top of Item */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[#F97316] rounded-full shadow-[0_1px_6px_rgba(249,115,22,0.4)]" />
              )}

              <div className="relative mt-1">
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#EF4444] text-white text-[9px] font-extrabold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight transition-all ${
                isActive ? "font-bold text-[#F97316]" : "font-medium text-gray-500"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
