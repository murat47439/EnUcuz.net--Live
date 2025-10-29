"use client";
import { useState } from "react";
import React from "react";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Button from "./button";
import Link from "next/link";
import { UserRound, LogOut, MessageSquare,PackageIcon,Heart,LucidePlusCircle  } from "lucide-react";


const Header: React.FC = () => {
    const {user, logout} = useAuth();
    const [open, setOpen] = useState(false);
    return(
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 z-50 w-full flex justify-between items-center">
            <Link href="/">
            <Image src={"/logo.png"} alt="logo" width={180} height={80} />

            </Link>
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
        </header>
    )
}

export default Header