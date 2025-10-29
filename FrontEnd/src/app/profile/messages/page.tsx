import React from "react";
import { Hourglass } from "lucide-react";
import Link from "next/link";
export default function messagesPage(){
    return (
       <div className="w-full h-full fixed top-0 left-0 flex flex-col justify-center items-center bg-white/60 backdrop-blur-sm z-50 pointer-events-none">
  <Hourglass size={56} className="pointer-events-auto text-gray-700" />
  <span className="mt-4 text-gray-800 font-extrabold text-lg pointer-events-auto">Çok Yakında</span><br/>
  <Link href="/" className="border rounded-full px-4 py-2 text-gray-800 font-extrabold text-lg pointer-events-auto hover:bg-blue-500 hover:text-white">Anasayfaya Dön</Link>
</div>



    )
}