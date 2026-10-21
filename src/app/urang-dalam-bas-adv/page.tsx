"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Package, 
  TrendingUp, 
  Layers, 
  Check, 
  X, 
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  Eye,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  ShoppingCart,
  Image as ImageIcon,
  Briefcase,
  Settings,
  Database,
  History,
  LogOut,
  Upload,
  Copy,
  Download,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  KeyRound
} from "lucide-react";

export default function UrangDalamAdminPortal() {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "categories" | "banners" | "portfolio" | "settings" | "orders" | "backup" | "account"
  >("dashboard");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Product filters
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("Semua");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [deleteConfirmProd, setDeleteConfirmProd] = useState<any | null>(null);

  // Helper untuk broadcast update katalog ke seluruh tab/halaman
  const notifyProductCatalogUpdated = () => {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bas_products_updated"));
        localStorage.setItem("bas_catalog_version", Date.now().toString());
      }
    } catch {
      // Abaikan jika di konteks terbatas
    }
  };

  // Product modal
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodModalMode, setProdModalMode] = useState<"add" | "edit">("add");
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "",
    categoryId: "",
    price: 0,
    compareAtPrice: "",
    unit: "/ pcs",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    description: "",
    isBestSeller: false,
    isActive: true,
    specsText: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catModalMode, setCatModalMode] = useState<"add" | "edit">("add");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    icon: "Package",
    sortOrder: 0,
    isActive: true,
  });

  // Banner modal
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    id: "",
    title: "",
    subtitle: "",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    ctaLabel: "Pesan Sekarang",
    ctaHref: "/produk",
    sortOrder: 1,
    isActive: true,
  });

  // Order modal / detail
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("Semua");

  // Account modal
  const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // Reset confirmation
  const [resetConfirmInput, setResetConfirmInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Show Toast Helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Initial Session Check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthChecking(false));
  }, []);

  // 2. Fetch Data when Authenticated
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes, sRes, oRes] = await Promise.all([
        fetch("/api/products?includeInactive=true", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/categories?includeInactive=true", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/banners?includeInactive=true", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/orders", { cache: "no-store" }).then((r) => r.json()),
      ]);

      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) {
        setCategories(cRes.data);
        if (!prodForm.categoryId && cRes.data.length > 0) {
          setProdForm((prev) => ({ ...prev, categoryId: cRes.data[0].id }));
        }
      }
      if (bRes.success) setBanners(bRes.data);
      if (sRes.success) setSettings(sRes.data);
      if (oRes.success) setOrders(oRes.data);
    } catch (err: any) {
      showToast("Gagal memuat beberapa data dari server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        showToast("Selamat datang di Urang Dalam BAS ADV", "success");
      } else {
        setLoginError(data.error || "Login gagal");
      }
    } catch {
      setLoginError("Terjadi kesalahan koneksi server");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    showToast("Anda telah keluar dari panel Urang Dalam", "success");
  };

  // Handle Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProdForm((prev) => ({ ...prev, imageUrl: data.url }));
        showToast("Foto produk berhasil diunggah", "success");
      } else {
        showToast(data.error || "Gagal upload gambar", "error");
      }
    } catch {
      showToast("Gagal upload gambar ke server", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // ==========================================
  // PRODUCT ACTIONS
  // ==========================================
  const openAddProductModal = () => {
    setProdModalMode("add");
    setEditingProdId(null);
    setProdForm({
      name: "",
      categoryId: categories[0]?.id || "cat-outlet",
      price: 25000,
      compareAtPrice: "",
      unit: "/ pcs",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      description: "",
      isBestSeller: false,
      isActive: true,
      specsText: "Bahan Berkualitas Tinggi\nCetak Presisi & Anti Pudar\nGaransi Hasil Maksimal",
    });
    setIsProdModalOpen(true);
  };

  const openEditProductModal = (p: any) => {
    setProdModalMode("edit");
    setEditingProdId(p.id);

    const matchedCat = categories.find(
      (c) => c.id === p.categoryId || c.name === p.category || c.slug === p.category
    );
    const catId = matchedCat ? matchedCat.id : (categories[0]?.id || "cat-outlet");

    let priceVal = p.priceNumber;
    if (priceVal === undefined || priceVal === null) {
      priceVal = typeof p.price === "number" ? p.price : parseInt(String(p.price || "").replace(/[^0-9]/g, ""), 10) || 0;
    }

    let compareVal = p.compareAtPrice;
    if (compareVal === undefined || compareVal === null) {
      compareVal = p.normalPrice ? parseInt(String(p.normalPrice).replace(/[^0-9]/g, ""), 10) : "";
    }

    setProdForm({
      name: p.name || p.title || "",
      categoryId: catId,
      price: priceVal || 0,
      compareAtPrice: compareVal ? String(compareVal) : "",
      unit: p.unit || "/ pcs",
      imageUrl: p.imageUrl || p.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      description: p.description || p.desc || "",
      isBestSeller: Boolean(p.isBestSeller),
      isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
      specsText: Array.isArray(p.specs) ? p.specs.join("\n") : (p.specs || ""),
    });
    setIsProdModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.categoryId || prodForm.price <= 0) {
      showToast("Nama, kategori, dan harga produk wajib diisi dengan benar", "error");
      return;
    }

    const payload = {
      name: prodForm.name.trim(),
      categoryId: prodForm.categoryId,
      price: Number(prodForm.price),
      compareAtPrice: prodForm.compareAtPrice ? Number(prodForm.compareAtPrice) : null,
      unit: prodForm.unit.trim() || "/ pcs",
      imageUrl: prodForm.imageUrl.trim() || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      description: prodForm.description.trim(),
      isBestSeller: Boolean(prodForm.isBestSeller),
      isActive: Boolean(prodForm.isActive),
      specs: prodForm.specsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (prodModalMode === "add") {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Produk baru berhasil ditambahkan", "success");
          setIsProdModalOpen(false);
          notifyProductCatalogUpdated();
          refreshAllData();
        } else {
          showToast(data.error || "Gagal menambah produk", "error");
        }
      } else {
        const res = await fetch(`/api/products/${editingProdId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Produk berhasil diperbarui", "success");
          setIsProdModalOpen(false);
          notifyProductCatalogUpdated();
          refreshAllData();
        } else {
          showToast(data.error || "Gagal mengupdate produk", "error");
        }
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan produk", "error");
    }
  };

  const handleToggleProductStatus = async (p: any) => {
    const newStatus = !p.isActive;
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Produk '${p.name || p.title}' ${newStatus ? "diaktifkan" : "dinonaktifkan"}`, "success");
        notifyProductCatalogUpdated();
        refreshAllData();
      } else {
        showToast(data.error || "Gagal mengubah status produk", "error");
      }
    } catch {
      showToast("Terjadi kesalahan koneksi", "error");
    }
  };

  const handleExecuteDelete = async (id: string, name: string, permanent: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}${permanent ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          permanent
            ? `Produk '${name}' berhasil dihapus permanen dari database`
            : `Produk '${name}' berhasil dinonaktifkan dari katalog publik`,
          "success"
        );
        setDeleteConfirmProd(null);
        notifyProductCatalogUpdated();
        refreshAllData();
      } else {
        showToast(data.error || "Gagal menghapus produk", "error");
      }
    } catch {
      showToast("Gagal menghapus produk", "error");
    }
  };

  const handleDeleteProduct = (id: string, name: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setDeleteConfirmProd(target);
    } else {
      setDeleteConfirmProd({ id, name, title: name });
    }
  };

  const handleDuplicateProduct = async (p: any) => {
    const payload = {
      name: `${p.name || p.title} (Salinan)`,
      categoryId: p.categoryId,
      price: p.priceNumber || 0,
      compareAtPrice: p.compareAtPrice,
      unit: p.unit || "/ pcs",
      imageUrl: p.imageUrl || p.img,
      description: p.description || p.desc || "",
      isBestSeller: false,
      isActive: true,
      specs: p.specs || [],
    };
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Produk berhasil diduplikasi", "success");
        refreshAllData();
      }
    } catch {
      showToast("Gagal menduplikasi produk", "error");
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Jalankan aksi ${action} pada ${selectedProductIds.length} produk terpilih?`)) return;

    try {
      const res = await fetch("/api/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedProductIds }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setSelectedProductIds([]);
        refreshAllData();
      } else {
        showToast(data.error, "error");
      }
    } catch {
      showToast("Gagal memproses aksi massal", "error");
    }
  };

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  const openAddCategoryModal = () => {
    setCatModalMode("add");
    setEditingCatId(null);
    setCatForm({
      name: "",
      slug: "",
      icon: "Package",
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (c: any) => {
    setCatModalMode("edit");
    setEditingCatId(c.id);
    setCatForm({
      name: c.name,
      slug: c.slug,
      icon: c.icon || "Package",
      sortOrder: c.sortOrder || 0,
      isActive: c.isActive,
    });
    setIsCatModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    try {
      if (catModalMode === "add") {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Kategori baru berhasil ditambahkan", "success");
          setIsCatModalOpen(false);
          refreshAllData();
        } else {
          showToast(data.error, "error");
        }
      } else {
        const res = await fetch(`/api/categories/${editingCatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast("Kategori berhasil diperbarui", "success");
          setIsCatModalOpen(false);
          refreshAllData();
        } else {
          showToast(data.error, "error");
        }
      }
    } catch {
      showToast("Gagal menyimpan kategori", "error");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori '${name}'?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast(`Kategori '${name}' berhasil dihapus`, "success");
        refreshAllData();
      } else {
        showToast(data.error || "Gagal menghapus kategori", "error");
      }
    } catch {
      showToast("Gagal menghapus kategori", "error");
    }
  };

  // ==========================================
  // SETTINGS ACTIONS
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Pengaturan sistem berhasil disimpan & disinkronkan ke seluruh web", "success");
      } else {
        showToast(data.error || "Gagal menyimpan pengaturan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan pengaturan", "error");
    }
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
        refreshAllData();
      } else {
        showToast(data.error || "Gagal mengubah status", "error");
      }
    } catch {
      showToast("Gagal menghubungi server pesanan", "error");
    }
  };

  const exportOrdersToCsv = () => {
    if (orders.length === 0) {
      showToast("Belum ada data pesanan untuk diekspor", "error");
      return;
    }
    const headers = ["Kode Pesanan", "Tanggal", "Nama Pelanggan", "WhatsApp", "Metode Kirim", "Alamat", "Pembayaran", "Subtotal", "Status"];
    const rows = orders.map((o) => [
      `"${o.code}"`,
      `"${new Date(o.createdAt).toLocaleString("id-ID")}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryMethod}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      `"${o.paymentMethod}"`,
      o.subtotal,
      `"${o.status}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pesanan-bas-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("File CSV pesanan berhasil diunduh", "success");
  };

  // ==========================================
  // BACKUP & RESET
  // ==========================================
  const handleDownloadBackup = () => {
    window.open("/api/admin/backup", "_blank");
    showToast("Salinan backup database JSON berhasil diunduh", "success");
  };

  const handleResetDatabase = async () => {
    if (resetConfirmInput !== "RESET") {
      showToast("Ketik 'RESET' dengan huruf kapital untuk konfirmasi reset database", "error");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", confirmText: "RESET" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setResetConfirmInput("");
        refreshAllData();
      } else {
        showToast(data.error || "Gagal mereset database", "error");
      }
    } catch {
      showToast("Terjadi kesalahan proses reset", "error");
    } finally {
      setIsResetting(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Password admin berhasil diperbarui", "success");
        setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(data.error || "Gagal mengubah password", "error");
      }
    } catch {
      showToast("Gagal menghubungi server", "error");
    }
  };

  // ------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // ------------------------------------------
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0B1E36] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide text-gray-300">
            Memeriksa Kredensial Urang Dalam...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1E36] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#1E1B4B] to-[#0B1E36] rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
              <ShieldCheck size={32} className="text-[#F97316]" />
            </div>
            <h1 className="font-display text-2xl text-[#0B1E36] tracking-tight">
              Urang Dalam BAS ADV
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Portal Manajemen Percetakan & Konten Terintegrasi
            </p>
          </div>

          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-[#F97316] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk ke Panel Urang Dalam"}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 font-medium">
              <ArrowLeft size={13} /> Kembali ke Beranda Publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    if (productStatusFilter === "active" && !p.isActive) return false;
    if (productStatusFilter === "inactive" && p.isActive) return false;
    const matchCat = productCatFilter === "Semua" || p.category === productCatFilter || p.categoryId === productCatFilter;
    const q = productSearch.toLowerCase();
    const title = (p.name || p.title || "").toLowerCase();
    const desc = (p.description || p.desc || "").toLowerCase();
    return matchCat && (title.includes(q) || desc.includes(q));
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "Semua") return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-800 flex flex-col">
      {/* Toast popup */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-white transition-all transform animate-bounce ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP ADMIN HEADER */}
      <header className="bg-[#0B1E36] text-white sticky top-0 z-40 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-white p-1 border border-white/20 shadow-sm flex items-center justify-center shrink-0">
            <Image
              src="/logo-icon.png"
              alt="Cetak.inc"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight">
                Cetak.inc — Urang Dalam
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE DB ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              Panel Kontrol Utama & Manajemen Katalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={refreshAllData}
            title="Refresh Data dari Database"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={13} /> <span className="hidden sm:inline">Lihat Web Publik</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={13} /> <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS RAIL */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar flex gap-2">
        {[
          { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
          { id: "products", label: `Katalog Produk (${products.length})`, icon: Package },
          { id: "categories", label: `Kategori (${categories.length})`, icon: Layers },
          { id: "orders", label: `Pesanan (${orders.length})`, icon: ShoppingCart },
          { id: "banners", label: "Banner Promo", icon: ImageIcon },
          { id: "settings", label: "Pengaturan & WA", icon: Settings },
          { id: "backup", label: "Backup & Reset", icon: Database },
          { id: "account", label: "Keamanan Akun", icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap inline-flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? "bg-[#0B1E36] text-white shadow-xs"
                  : "bg-gray-100/70 hover:bg-gray-200/80 text-gray-600"
              }`}
            >
              <Icon size={14} className={isActive ? "text-[#F97316]" : ""} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN ADMIN CONTENT CONTAINER */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD RINGKASAN */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Produk</span>
                  <Package size={20} className="text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1E36]">
                  {products.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {products.filter((p) => p.isActive).length} Produk Aktif Publik
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Kategori</span>
                  <Layers size={20} className="text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1E36]">
                  {categories.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  8 Kelompok Branding & Merchandise
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pesanan Masuk</span>
                  <ShoppingCart size={20} className="text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1E36]">
                  {orders.length}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {orders.filter((o) => o.status === "BARU").length} Pesanan Baru Menunggu
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Nilai Transaksi</span>
                  <TrendingUp size={20} className="text-[#F97316]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#F97316] truncate">
                  Rp {orders.reduce((sum, o) => sum + (o.subtotal || 0), 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Akumulasi Nilai Pesanan Terdata
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-3">
                <h2 className="font-extrabold text-sm text-[#0B1E36]">Aksi Cepat</h2>
                <div className="space-y-2">
                  <button
                    onClick={openAddProductModal}
                    className="w-full p-3 bg-orange-50 hover:bg-orange-100 text-[#F97316] font-bold rounded-2xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> Tambah Produk Baru
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <ShoppingCart size={16} /> Kelola Pesanan WhatsApp
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <Settings size={16} /> Ganti Nomor WhatsApp Toko
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <Download size={16} /> Download Backup Database
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-sm text-[#0B1E36]">Pesanan Terbaru</h2>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-[#F97316] font-bold hover:underline"
                  >
                    Lihat Semua ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">Belum ada pesanan masuk.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-900">{ord.code}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {ord.customerName} ({ord.customerPhone}) • {ord.deliveryMethod === "kirim" ? "Kirim" : "Ambil di Toko"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#F97316]">
                            Rp {Number(ord.subtotal).toLocaleString("id-ID")}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {new Date(ord.createdAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUK CRUD */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setProductStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  productStatusFilter === "all"
                    ? "bg-[#0B1E36] text-white shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                Semua Produk ({products.length})
              </button>
              <button
                onClick={() => setProductStatusFilter("active")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  productStatusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-100"
                }`}
              >
                Aktif Publik ({products.filter((p) => p.isActive).length})
              </button>
              <button
                onClick={() => setProductStatusFilter("inactive")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  productStatusFilter === "inactive"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50/70 text-rose-700 hover:bg-rose-100/70 border border-rose-100"
                }`}
              >
                Nonaktif ({products.filter((p) => !p.isActive).length})
              </button>
            </div>

            {/* Action Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau deskripsi produk..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {selectedProductIds.length > 0 && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleBulkAction("activate")}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Aktifkan ({selectedProductIds.length})
                    </button>
                    <button
                      onClick={() => handleBulkAction("deactivate")}
                      className="px-3 py-2 bg-gray-600 text-white rounded-xl text-xs font-bold"
                    >
                      Nonaktifkan
                    </button>
                  </div>
                )}
                <button
                  onClick={openAddProductModal}
                  className="px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={16} /> Tambah Produk
                </button>
              </div>
            </div>

            {/* Product Table / Cards */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedProductIds(filteredProducts.map((p) => p.id));
                            else setSelectedProductIds([]);
                          }}
                        />
                      </th>
                      <th className="p-3.5">Produk</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Harga</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right sticky right-0 bg-gray-50/80">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          Tidak ada produk yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                                  else setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                                }}
                              />
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                  <Image
                                    src={p.imageUrl || p.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"}
                                    alt={p.name || p.title}
                                    fill
                                    sizes="48px"
                                    unoptimized={Boolean((p.imageUrl || p.img)?.startsWith("data:"))}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <div className="font-bold text-gray-900 truncate">{p.name || p.title}</div>
                                  <div className="text-[10px] text-gray-400 truncate">{p.description || p.desc || "-"}</div>
                                  {p.isBestSeller && (
                                    <span className="text-[9px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.2 rounded inline-block mt-0.5">
                                      Terlaris
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-full text-[10px]">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-[#F97316]">
                              {p.price} <span className="text-[10px] text-gray-400 font-normal">{p.unit}</span>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleToggleProductStatus(p)}
                                title={p.isActive ? "Klik untuk Nonaktifkan dari katalog" : "Klik untuk Aktifkan ke katalog"}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                                  p.isActive
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                                {p.isActive ? "Aktif" : "Nonaktif"}
                              </button>
                            </td>
                            <td className="p-3.5 text-right sticky right-0 bg-white">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  title="Duplikasi Produk"
                                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => openEditProductModal(p)}
                                  title="Edit Produk"
                                  className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name || p.title)}
                                  title="Hapus / Nonaktifkan Produk"
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KATEGORI CRUD */}
        {/* ========================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-gray-900">Kategori Produk</h2>
                <p className="text-xs text-gray-500">
                  Kategori mengelompokkan checklist produk branding & merchandise di web.
                </p>
              </div>
              <button
                onClick={openAddCategoryModal}
                className="px-4 py-2 bg-[#F97316] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Tambah Kategori
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono">#{c.sortOrder || 1}</span>
                      <h3 className="font-bold text-sm text-gray-900 mt-0.5">{c.name}</h3>
                      <p className="text-[10px] text-gray-400">Slug: {c.slug}</p>
                    </div>
                    <span className="bg-orange-50 text-[#F97316] text-xs font-bold px-2.5 py-1 rounded-full">
                      {c.productCount || 0} Produk
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditCategoryModal(c)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PESANAN ADMIN */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Filter Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="BARU">BARU</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SIAP">SIAP</option>
                  <option value="SELESAI">SELESAI</option>
                  <option value="BATAL">BATAL</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportOrdersToCsv}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet size={14} /> Ekspor Excel / CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Kode Pesanan</th>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Metode & Bayar</th>
                      <th className="p-3.5">Subtotal</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          Tidak ada pesanan yang sesuai filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-gray-900">{o.code}</td>
                          <td className="p-3.5 text-gray-500">
                            {new Date(o.createdAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-gray-900">{o.customerName}</div>
                            <div className="text-[11px] text-gray-500">{o.customerPhone}</div>
                          </td>
                          <td className="p-3.5">
                            <div>{o.deliveryMethod === "kirim" ? "🚚 Kirim Alamat" : "🏬 Ambil Workshop"}</div>
                            <div className="text-[10px] text-gray-400">{o.paymentMethod}</div>
                          </td>
                          <td className="p-3.5 font-extrabold text-[#F97316]">
                            Rp {Number(o.subtotal).toLocaleString("id-ID")}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                o.status === "BARU"
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : o.status === "DIPROSES"
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : o.status === "SIAP"
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : o.status === "SELESAI"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-red-50 text-red-600 border-red-200"
                              }`}
                            >
                              <option value="BARU">BARU</option>
                              <option value="DIPROSES">DIPROSES</option>
                              <option value="SIAP">SIAP</option>
                              <option value="SELESAI">SELESAI</option>
                              <option value="BATAL">BATAL</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`https://wa.me/${String(o.customerPhone).replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs"
                                title="Chat Pelanggan di WhatsApp"
                              >
                                <Phone size={14} />
                              </a>
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold"
                              >
                                Rincian
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PENGATURAN & WA TEMPLATE */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <h2 className="font-extrabold text-base text-[#0B1E36] pb-2 border-b border-gray-100">
                Kontak & Lokasi Workshop Padang
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor WhatsApp Admin (Penerima Pesanan) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 6281234567890"
                    value={settings["contact.whatsapp"] || ""}
                    onChange={(e) => setSettings({ ...settings, "contact.whatsapp": e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Semua pesanan keranjang & tombol kontak akan otomatis mengarah ke nomor ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={settings["contact.email"] || ""}
                    onChange={(e) => setSettings({ ...settings, "contact.email": e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Alamat Workshop Cetak
                  </label>
                  <input
                    type="text"
                    value={settings["contact.address"] || ""}
                    onChange={(e) => setSettings({ ...settings, "contact.address": e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Label Lokasi Header
                  </label>
                  <input
                    type="text"
                    value={settings["location.chipLabel"] || ""}
                    onChange={(e) => setSettings({ ...settings, "location.chipLabel": e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={settings["contact.hours"] || ""}
                    onChange={(e) => setSettings({ ...settings, "contact.hours": e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Template Pesan WA */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <h2 className="font-extrabold text-base text-[#0B1E36] pb-2 border-b border-gray-100">
                Template Format Pesanan WhatsApp
              </h2>
              <p className="text-xs text-gray-500">
                Gunakan tag: <code>{'{code}'}</code>, <code>{'{nama}'}</code>, <code>{'{phone}'}</code>, <code>{'{metode}'}</code>, <code>{'{alamat}'}</code>, <code>{'{pembayaran}'}</code>, <code>{'{catatan}'}</code>, <code>{'{items}'}</code>, <code>{'{total}'}</code>.
              </p>
              <textarea
                rows={8}
                value={settings["checkout.waTemplate"] || ""}
                onChange={(e) => setSettings({ ...settings, "checkout.waTemplate": e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all"
              >
                Simpan & Terapkan Pengaturan
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 6: BACKUP & RESET DATABASE */}
        {/* ========================================================= */}
        {activeTab === "backup" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
              <h2 className="font-extrabold text-base text-[#0B1E36]">Ekspor & Backup Database</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Unduh salinan cadangan lengkap seluruh katalog produk, kategori, banner, pengaturan, dan portofolio dalam bentuk file JSON terenkripsi.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="px-5 py-2.5 bg-[#0B1E36] hover:bg-black text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Download size={15} /> Download Full Database JSON
              </button>
            </div>

            {/* Reset Area with Typing Confirmation */}
            <div className="bg-red-50/70 p-6 rounded-3xl border border-red-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <h2 className="font-extrabold text-base">Reset Database ke Default</h2>
              </div>
              <p className="text-xs text-red-600 leading-relaxed">
                Aksi ini akan mengembalikan seluruh produk (89 produk) dan 8 kategori ke seed awal. Sistem akan <strong>secara otomatis membuat file backup cadangan</strong> di folder server sebelum reset dijalankan, sehingga tidak ada data yang hilang permanen.
              </p>

              <div className="max-w-md space-y-3">
                <label className="block text-xs font-bold text-red-800">
                  Ketik "RESET" untuk mengonfirmasi:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik RESET"
                    value={resetConfirmInput}
                    onChange={(e) => setResetConfirmInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-red-300 rounded-xl text-xs font-bold text-red-700 focus:outline-none"
                  />
                  <button
                    onClick={handleResetDatabase}
                    disabled={resetConfirmInput !== "RESET" || isResetting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    {isResetting ? "Mereset..." : "Jalankan Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: GANTI PASSWORD ADMIN */}
        {/* ========================================================= */}
        {activeTab === "account" && (
          <div className="max-w-lg bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <h2 className="font-extrabold text-base text-[#0B1E36] pb-2 border-b border-gray-100">
              Ubah Password Urang Dalam
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password Lama *</label>
                <input
                  type="password"
                  required
                  value={passForm.oldPassword}
                  onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password Baru (Min. 6 karakter) *</label>
                <input
                  type="password"
                  required
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Konfirmasi Password Baru *</label>
                <input
                  type="password"
                  required
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B1E36] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Perbarui Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT PRODUK */}
      {/* ========================================================= */}
      {isProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col my-auto">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-sm sm:text-base text-gray-900">
                {prodModalMode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
              </h2>
              <button onClick={() => setIsProdModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-4 sm:p-6 space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Produk Cetak *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paper Cup Panas 8oz Double Wall"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori *</label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Satuan Harga</label>
                  <input
                    type="text"
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    placeholder="/ pcs, / box, / rim..."
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Harga Jual (Angka Rupiah) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodForm.price || ""}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Harga Coret / Normal (Opsional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Kosongkan jika tidak promo"
                    value={prodForm.compareAtPrice}
                    onChange={(e) => setProdForm({ ...prodForm, compareAtPrice: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-500"
                  />
                </div>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Foto / URL Gambar Produk *</label>
                <div className="flex gap-2 items-center">
                  {prodForm.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <Image
                        src={prodForm.imageUrl}
                        alt="Preview"
                        fill
                        unoptimized={prodForm.imageUrl.startsWith("data:")}
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <input
                    type="text"
                    required
                    value={prodForm.imageUrl}
                    onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })}
                    placeholder="Masukkan URL gambar atau klik Upload Foto..."
                    className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl inline-flex items-center gap-1 shrink-0"
                  >
                    <Upload size={14} /> {uploadingImage ? "Mengunggah..." : "Upload Foto"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Spesifikasi & Keunggulan (Pisahkan dengan Enter)
                </label>
                <textarea
                  rows={3}
                  value={prodForm.specsText}
                  onChange={(e) => setProdForm({ ...prodForm, specsText: e.target.value })}
                  placeholder="Bahan Kraft Food Grade&#10;Tahan Panas & Bocor&#10;Bisa Custom Sablon Full Color"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                    className="rounded text-[#F97316]"
                  />
                  <span>Tandai sebagai Best Seller 🔥</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={prodForm.isActive}
                    onChange={(e) => setProdForm({ ...prodForm, isActive: e.target.checked })}
                    className="rounded text-[#F97316]"
                  />
                  <span>Produk Aktif Tayang</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProdModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {prodModalMode === "add" ? "Tambahkan ke Katalog" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETAIL PESANAN */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-mono">No. Pesanan:</span>
                <h3 className="font-extrabold text-base text-gray-900">{selectedOrder.code}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1.5">
              <div><strong>Nama:</strong> {selectedOrder.customerName}</div>
              <div><strong>WhatsApp:</strong> {selectedOrder.customerPhone}</div>
              <div><strong>Metode:</strong> {selectedOrder.deliveryMethod === "kirim" ? "Kirim ke Alamat" : "Ambil di Toko"}</div>
              {selectedOrder.address && <div><strong>Alamat:</strong> {selectedOrder.address}</div>}
              <div><strong>Pembayaran:</strong> {selectedOrder.paymentMethod}</div>
              {selectedOrder.note && <div><strong>Catatan:</strong> {selectedOrder.note}</div>}
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-700 mb-2">Daftar Item:</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-900">{it.nameSnapshot}</div>
                      <div className="text-[10px] text-gray-400">
                        {it.qty} {it.unitSnapshot || "pcs"} x Rp {it.priceSnapshot?.toLocaleString("id-ID")}
                      </div>
                      {it.designNote && <div className="text-[10px] text-gray-500 italic">Catatan: {it.designNote}</div>}
                    </div>
                    <div className="font-black text-[#F97316]">
                      Rp {Number(it.total).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">Total:</span>
              <span className="text-xl font-black text-[#F97316]">
                Rp {Number(selectedOrder.subtotal).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`https://wa.me/${String(selectedOrder.customerPhone).replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-[#25D366] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Phone size={14} /> Hubungi via WhatsApp
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT KATEGORI */}
      {/* ========================================================= */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                {catModalMode === "add" ? "Tambah Kategori Baru" : "Edit Kategori"}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="Contoh: Outdoor & Signage"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Urutan Tampil (Angka)</label>
                <input
                  type="number"
                  value={catForm.sortOrder}
                  onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: KONFIRMASI HAPUS / NONAKTIFKAN PRODUK */}
      {/* ========================================================= */}
      {deleteConfirmProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 pb-2 border-b border-gray-100">
              <div className="p-2.5 bg-red-50 rounded-2xl">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Kelola Produk</h3>
                <p className="text-xs text-gray-400">Pilih tindakan untuk produk ini</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                <Image
                  src={deleteConfirmProd.imageUrl || deleteConfirmProd.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"}
                  alt={deleteConfirmProd.name || deleteConfirmProd.title}
                  fill
                  sizes="48px"
                  unoptimized={Boolean((deleteConfirmProd.imageUrl || deleteConfirmProd.img)?.startsWith("data:"))}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-gray-900 truncate">
                  {deleteConfirmProd.name || deleteConfirmProd.title}
                </div>
                <div className="text-[10px] text-gray-400">
                  {deleteConfirmProd.category} • {deleteConfirmProd.price}
                </div>
                <span
                  className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-bold mt-1 ${
                    deleteConfirmProd.isActive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {deleteConfirmProd.isActive ? "Sedang Aktif Publik" : "Sedang Nonaktif"}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleExecuteDelete(deleteConfirmProd.id, deleteConfirmProd.name || deleteConfirmProd.title, false)}
                className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer"
              >
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-xl mt-0.5 shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs text-amber-900">Nonaktifkan Sementara (Rekomendasi)</div>
                  <div className="text-[10px] text-amber-700 leading-tight mt-0.5">
                    Produk disembunyikan dari katalog publik dan homepage, tetapi data tetap tersimpan di admin dan bisa diaktifkan kembali kapan saja.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteDelete(deleteConfirmProd.id, deleteConfirmProd.name || deleteConfirmProd.title, true)}
                className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer"
              >
                <div className="p-1.5 bg-red-100 text-red-700 rounded-xl mt-0.5 shrink-0">
                  <Trash2 size={16} />
                </div>
                <div>
                  <div className="font-bold text-xs text-red-900">Hapus Permanen dari Database</div>
                  <div className="text-[10px] text-red-700 leading-tight mt-0.5">
                    Hapus produk sepenuhnya dari sistem database SQLite dan JSON. Data tidak dapat dipulihkan.
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmProd(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
