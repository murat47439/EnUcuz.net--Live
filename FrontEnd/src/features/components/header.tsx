"use client";
import { useState, useCallback, useMemo } from "react";
import React from "react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Button from "./button";
import Link from "next/link";
import { UserRound, LogOut, MessageSquare,PackageIcon,Heart,LucidePlusCircle  } from "lucide-react";
import { Menu, XIcon, LucideHome, PowerIcon } from "lucide-react";


const Header: React.FC = () => {
    const {user, logout} = useAuth();
    const [open, setOpen] = useState(false);
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const handleMenuToggle = useCallback(() => {
        setMenuIsOpen(prev => !prev);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuIsOpen(false);
    }, []);

    const handleDropdownToggle = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const handleDropdownClose = useCallback(() => {
        setOpen(false);
    }, []);

    return(
        <header className="fixed top-0 left-0 right-0 z-50
                           bg-white/90 backdrop-blur-sm border-b border-gray-200/50
                           supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-md
                           shadow-md">
            <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                {/* Sol taraf - Menü butonu + Logo */}
                <div className="flex items-center gap-4">
                    <button
                        className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200/60 shadow-sm hover:bg-gray-50 transition-colors"
                        onClick={handleMenuToggle}
                        aria-label="Menüyü aç"
                    >
                        <Menu size={20} className="text-gray-700" />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative">
                            <Image
                                src={"/logo.png"}
                                alt="EnUcuz-Net Logo"
                                width={180}
                                height={70}
                                className="h-9 w-auto md:h-11"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Mobil yan menü */}
            <div
              className={`
                fixed top-0 left-0 h-screen w-full max-w-sm z-50
                bg-gradient-to-br from-white via-gray-50 to-white
                border-r border-gray-200/50 shadow-2xl
                transition-all duration-300 ease-in-out
                ${menuIsOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"}
              `}
            >
              {/* Kapatma Butonu */}
              <button
                onClick={handleMenuClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XIcon size={20} className="text-gray-700" />
              </button>

              {/* Kullanıcı Bilgisi */}
              <div className="w-full pt-16 pb-6 px-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200/60 shadow-sm">
                <div className="text-gray-600 text-sm font-medium">
                  Merhaba
                </div>
                {user && (
                  <p className="text-xl font-bold text-gray-800 mt-1">{user.name}</p>
                )}
              </div>

              {/* Menü İçeriği */}
              <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto bg-white/50">
                <div className="px-4 py-6">
                  {/* Anasayfa Linki */}
                  <Link
                    href="/"
                    onClick={handleMenuClose}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors mb-4 shadow-sm"
                  >
                    <span>Anasayfa</span>
                    <LucideHome size={20} />
                  </Link>

                  {/* Kategoriler */}
                  <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/80 shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <h2 className="font-bold text-xl text-gray-800">
                        Kategoriler
                      </h2>
                    </div>

                    <ul className="list-none space-y-2">
                      <li>
                        <Link
                          href="/"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-gray-800 font-semibold transition-colors border border-blue-100"
                        >
                          Tüm Kategoriler
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=2862"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-pink-50 text-gray-700 font-medium transition-colors"
                        >
                          Anne & Çocuk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=3186"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 font-medium transition-colors"
                        >
                          Spor
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=403"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-amber-50 text-gray-700 font-medium transition-colors"
                        >
                          Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=368"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-purple-50 text-gray-700 font-medium transition-colors"
                        >
                          Saat & Aksesuar
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1070"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-fuchsia-50 text-gray-700 font-medium transition-colors"
                        >
                          Kozmetik & Kişisel Bakım
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=758"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-teal-50 text-gray-700 font-medium transition-colors"
                        >
                          Ev & Mobilya
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1219"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-yellow-50 text-gray-700 font-medium transition-colors"
                        >
                          Süpermarket
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1071"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 font-medium transition-colors"
                        >
                          Elektronik
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=5558"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 font-medium transition-colors"
                        >
                          Bahçe
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1216"
                          onClick={handleMenuClose}
                          className="block px-4 py-3 rounded-xl hover:bg-indigo-50 text-gray-700 font-medium transition-colors"
                        >
                          Kitap & Kırtasiye
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Çıkış Yap Butonu */}
              {user && (
                <div className="absolute bottom-0 left-0 w-full border-t border-gray-200/60 bg-gradient-to-t from-white to-gray-50/80 p-4 shadow-lg">
                  <button
                    onClick={() => {
                      logout();
                      handleMenuClose();
                    }}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 rounded-xl text-gray-700 font-semibold transition-colors shadow-sm border border-red-100"
                  >
                    <span>Çıkış Yap</span>
                    <PowerIcon size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Sağ taraf - Kullanıcı / Giriş butonu */}
            <div className="ml-auto flex items-center gap-3">
                {!user ? (
                    <Link href="/login">
                        <Button variant="primary" className="h-11 px-6 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 transition-colors">
                            Giriş yap
                        </Button>
                    </Link>

                ) : (
                    <div className="relative inline-block">
                        <button
                            type="button"
                            className="flex items-center gap-2.5 rounded-xl bg-white hover:bg-gray-50 px-3 py-2 border border-gray-200/60 shadow-sm hover:shadow-md transition-colors"
                            onClick={handleDropdownToggle}
                        >
                            <span className="hidden sm:inline-block text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                                {user.name}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors flex items-center justify-center shadow-sm">
                                <UserRound className="w-5 h-5 text-blue-700" />
                            </div>
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200/60 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-1.5">
                                    <ul className="flex flex-col text-gray-700 select-none text-sm gap-0.5">
                                        <li>
                                            <Link href="/profile/new-product" onClick={handleDropdownClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <LucidePlusCircle size={14} className="text-blue-600" />
                                                </div>
                                                <span className="font-medium text-sm">Yeni İlan Ver</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/profile" onClick={handleDropdownClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <UserRound size={14} className="text-gray-600"/>
                                                </div>
                                                <span className="font-medium text-sm">Hesabım</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/profile/favories" onClick={handleDropdownClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                                                    <Heart size={14} className="text-pink-600"/>
                                                </div>
                                                <span className="font-medium text-sm">Favoriler</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/profile/products" onClick={handleDropdownClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-green-50 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <PackageIcon size={14} className="text-green-600" />
                                                </div>
                                                <span className="font-medium text-sm">Ürünlerim</span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/profile/messages" onClick={handleDropdownClose} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                                                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare size={14} className="text-purple-600" />
                                                </div>
                                                <span className="font-medium text-sm">Mesajlarım</span>
                                            </Link>
                                        </li>
                                        <li className="mt-1 pt-1.5 border-t border-gray-100">
                                            <button
                                                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                                                onClick={logout}
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                                    <LogOut size={14} className="text-red-600" />
                                                </div>
                                                <span className="font-medium text-sm text-gray-700">Çıkış yap</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Masaüstü kategori çubuğu */}
        <div className="sm:block hidden border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <ul className="flex justify-between items-center text-xs text-gray-700 py-2.5">
                      <li>
                        <Link
                          href="/"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-semibold transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          Tüm Kategoriler
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=2862"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-pink-50 hover:text-pink-700"
                        >
                          Anne & Çocuk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=3186"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-green-50 hover:text-green-700"
                        >
                          Spor
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=403"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-amber-50 hover:text-amber-700"
                        >
                          Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=368"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-purple-50 hover:text-purple-700"
                        >
                          Saat & Aksesuar
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1070"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-fuchsia-50 hover:text-fuchsia-700"
                        >
                          Kozmetik & Kişisel Bakım
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=758"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-teal-50 hover:text-teal-700"
                        >
                          Ev & Mobilya
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1219"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-yellow-50 hover:text-yellow-700"
                        >
                          Süpermarket
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1071"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          Elektronik
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=5558"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-green-50 hover:text-green-700"
                        >
                          Bahçe
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1216"
                          className="block px-4 py-2 rounded-xl text-gray-700 font-medium transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          Kitap & Kırtasiye
                        </Link>
                      </li>
                    </ul>
            </div>
        </div>
        </header>
    )
}

export default Header