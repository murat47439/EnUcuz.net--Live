"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import React from "react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound, LogOut, PackageIcon, Heart, LucidePlusCircle, Handshake,
  Menu, X, Home, Power, Search, ChevronDown, MessageSquareText
} from "lucide-react";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Dışarı tıklayınca dropdown kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  const categories = [
    { label: "Tüm Kategoriler", href: "/" },
    { label: "Anne & Çocuk", href: "/?category=2862" },
    { label: "Spor", href: "/?category=3186" },
    { label: "Ayakkabı", href: "/?category=403" },
    { label: "Saat & Aksesuar", href: "/?category=368" },
    { label: "Kozmetik", href: "/?category=1070" },
    { label: "Ev & Mobilya", href: "/?category=758" },
    { label: "Süpermarket", href: "/?category=1219" },
    { label: "Elektronik", href: "/?category=1071" },
    { label: "Bahçe", href: "/?category=5558" },
    { label: "Kitap & Kırtasiye", href: "/?category=1216" },
  ];

  const userMenuItems = [
    { label: "Yeni İlan Ver", href: "/profile/new-product", icon: LucidePlusCircle, color: "text-[#ff6000]" },
    { label: "Hesabım", href: "/profile", icon: UserRound, color: "text-gray-500" },
    { label: "Favoriler", href: "/profile/favories", icon: Heart, color: "text-red-500" },
    { label: "Ürünlerim", href: "/profile/products", icon: PackageIcon, color: "text-gray-500" },
    { label: "Tekliflerim", href: "/profile/tekliflerim", icon: Handshake, color: "text-gray-500" },
    { label: "Mesajlar", href: "/profile/chats", icon: MessageSquareText, color: "text-gray-500" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Ana Header Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="h-20 flex items-center gap-4">
            {/* Mobil Menü Butonu */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu size={22} className="text-gray-700" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="2pazar"
                width={500}
                height={300}
                className="h-20 w-auto sm:h-22"
                priority
              />
            </Link>

            {/* Desktop Arama */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ürün, marka veya kategori ara..."
                  className="w-full h-10 pl-4 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-10 w-11 flex items-center justify-center bg-[#ff6000] hover:bg-[#e55500] rounded-r-lg transition-colors"
                >
                  <Search size={16} className="text-white" />
                </button>
              </div>
            </form>

            {/* Sağ Taraf Butonları */}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {user ? (
                <>
                  {/* Favori */}
                  <Link href="/profile/favories" className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors relative" title="Favoriler">
                    <Heart size={20} className="text-gray-500" />
                  </Link>
                  <Link href="/profile/chats" className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors relative" title="Mesajlar">
                    <MessageSquareText size={20} className="text-gray-500" />
                  </Link>

                  {/* Kullanıcı Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-lg hover:bg-gray-50 px-2 py-1.5 transition-colors"
                      onClick={() => setDropdownOpen(prev => !prev)}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#fff4ed] flex items-center justify-center">
                        <UserRound className="w-4 h-4 text-[#ff6000]" />
                      </div>
                      <div className="hidden sm:flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Kullanıcı Adı */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500">Hesabınız</p>
                        </div>

                        <div className="py-1">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon size={16} className={item.color} />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-gray-100">
                          <button
                            onClick={() => { logout(); setDropdownOpen(false); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm w-full hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} className="text-red-500" />
                            <span className="font-medium text-red-600">Çıkış Yap</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login">
                  <button className="h-9 px-5 rounded-lg text-sm font-semibold bg-[#ff6000] hover:bg-[#e55500] text-white transition-colors">
                    Giriş Yap
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobil Arama */}
          <form onSubmit={handleSearch} className="sm:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün, marka veya kategori ara..."
                className="w-full h-10 pl-4 pr-11 rounded-lg bg-gray-50 border border-gray-200 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all outline-none"
              />
              <button type="submit" className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-[#ff6000] rounded-r-lg">
                <Search size={15} className="text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Kategori Çubuğu - Desktop */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <ul className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {categories.map((cat, idx) => (
              <li key={idx} className="flex-shrink-0">
                <Link
                  href={cat.href}
                  className={`block px-3.5 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap relative hover:text-[#ff6000] ${idx === 0
                    ? "text-[#ff6000] font-semibold"
                    : "text-gray-600"
                    }`}
                >
                  {cat.label}
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#ff6000] rounded-full" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobil Yan Menü - Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMobile}
      />

      {/* Mobil Yan Menü - Panel */}
      <nav
        className={`fixed top-0 left-0 h-screen w-[280px] z-[70] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Üst */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Image src="/logo.png" alt="2pazar" width={180} height={60} className="h-10 w-auto" />
          <button onClick={closeMobile} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Kullanıcı */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#fff4ed] flex items-center justify-center">
                <UserRound size={16} className="text-[#ff6000]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-[11px] text-gray-500">Hesabınız</p>
              </div>
            </div>
          </div>
        )}

        {/* Sayfa Linkleri */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-800 transition-colors">
              <Home size={16} className="text-gray-400" />
              Anasayfa
            </Link>

            {user && (
              <div className="mt-1 space-y-0.5">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                  >
                    <item.icon size={16} className={item.color} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Kategoriler */}
          <div className="px-3 pt-2 pb-3 border-t border-gray-100">
            <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategoriler</p>
            <div className="space-y-0.5">
              {categories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  onClick={closeMobile}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? "text-[#ff6000] bg-[#fff4ed]" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alt */}
        {user ? (
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => { logout(); closeMobile(); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
            >
              <Power size={15} />
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-gray-100">
            <Link href="/login" onClick={closeMobile}>
              <button className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#ff6000] hover:bg-[#e55500] text-white transition-colors">
                Giriş Yap
              </button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header