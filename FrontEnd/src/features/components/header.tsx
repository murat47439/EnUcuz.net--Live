"use client";
import { useState } from "react";
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
    return(
        <header className="fixed top-0 left-0 right-0  bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 z-50 w-full">
            <div className="h-16 flex justify-between items-center">
                <div className="flex items-center">
            <button className="sm:hidden border-none max-w-12 bg-transparent" onClick={() => setMenuIsOpen(!menuIsOpen)}><Menu size={25}></Menu></button>
            <div
              className={`
                fixed top-0 left-0 h-screen w-full max-w-sm bg-white/95 backdrop-blur-md shadow-xl z-50
                transition-all duration-300 ease-in-out
                ${menuIsOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"}
              `}
            >
              {/* Kapatma Butonu */}
              <button
                onClick={() => setMenuIsOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XIcon size={20} className="text-gray-700" />
              </button>

              {/* Kullanıcı Bilgisi */}
              <div className="w-full pt-16 pb-6 px-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="text-gray-600 text-sm font-medium">
                  Merhaba
                </div>
                {user && (
                  <p className="text-xl font-bold text-gray-800 mt-1">{user.name}</p>
                )}
              </div>

              {/* Menü İçeriği */}
              <div className="flex flex-col h-[calc(100vh-140px)] overflow-y-auto">
                <div className="px-4 py-6">
                  {/* Anasayfa Linki */}
                  <Link
                    href="/"
                    onClick={() => setMenuIsOpen(false)}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition-colors mb-4"
                  >
                    <span>Anasayfa</span>
                    <LucideHome size={20} />
                  </Link>

                  {/* Kategoriler */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h2 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 mb-4">
                      Kategoriler
                    </h2>

                    <ul className="list-none space-y-1">
                      <li>
                        <Link
                          href="/"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Tüm Kategoriler
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=2862"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Anne & Çocuk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=3186"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Spor
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=403"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=368"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Saat & Aksesuar
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1070"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Kozmetik & Kişisel Bakım
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=758"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Ev & Mobilya
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1219"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Süpermarket
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1071"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Elektronik
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=5558"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Bahçe
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1216"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
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
                <div className="absolute bottom-0 left-0 w-full border-t border-gray-100 bg-white p-4">
                  <button
                    onClick={() => {
                      logout();
                      setMenuIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 font-semibold transition-colors"
                  >
                    <span>Çıkış Yap</span>
                    <PowerIcon size={20} />
                  </button>
                </div>
              )}
            </div>

            <Link href="/">
            <Image src={"/logo.png"} alt="logo" width={180} height={80} />

            </Link>
            </div>
            <div className="ml-auto">
            
            {!user ? (
                <Link href="/login">
                    <Button variant="primary" className="h-10 w-full px-8 rounded-full">Giriş yap</Button>
                </Link>

            ) : (<div className="relative inline-block">
                <div className="grid grid-cols-2 items-center gap-4">
                    {user.name}
                <div className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center cursor-pointer" onClick={() => setOpen(!open)}>
                    <UserRound/>
                </div>
                </div>
                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                <ul className="flex flex-col text-gray-700 select-none text-sm">
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer "><Link href="/profile/new-product" onClick={() =>setOpen(false)} className="flex items-center gap-2"><LucidePlusCircle size={20} />Yeni İlan Ver</Link></li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer "><Link href="/profile" onClick={() =>setOpen(false)} className="flex items-center gap-2"><UserRound size={20}/>Hesabım</Link></li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer "><Link href="/profile/favories" onClick={() =>setOpen(false)} className="flex items-center gap-2"><Heart size={20}/>Favoriler</Link></li>

                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"><Link href="/profile/products" onClick={() =>setOpen(false)} className="flex items-center gap-2"><PackageIcon size={20} />Ürünlerim</Link></li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"><Link href="/profile/messages" onClick={() =>setOpen(false)} className="flex items-center gap-2"><MessageSquare size={20} />Mesajlarım</Link></li>
                <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer "><button className="bg-white text-gray-700 hover:text-black border-none flex items-center gap-2 cursor-pointer" onClick={logout}><LogOut size={20} />Çıkış yap</button></li>
                </ul>
                </div>
                )}
                
                </div>)}
            </div>
        </div>
        <div className="sm:block hidden w-full h-1 bg-gray-600"></div>
        <div className="sm:block hidden">
        <ul className=" list-none space-y-1 flex justify-around">
                      <li>
                        <Link
                          href="/"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Tüm Kategoriler
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=2862"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Anne & Çocuk
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=3186"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Spor
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=403"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Ayakkabı
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=368"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Saat & Aksesuar
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1070"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Kozmetik & Kişisel Bakım
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=758"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Ev & Mobilya
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1219"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Süpermarket
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1071"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Elektronik
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=5558"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Bahçe
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/?category=1216"
                          onClick={() => setMenuIsOpen(false)}
                          className="block px-3 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                          Kitap & Kırtasiye
                        </Link>
                      </li>
                    </ul>
        </div>
        </header>
    )
}

export default Header