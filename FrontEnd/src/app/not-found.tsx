import Link from "next/link";
import Button from "@/features/components/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Search className="text-gray-600" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Sayfa Bulunamadı</h2>
          <p className="text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="flex items-center justify-center gap-2">
              <Home size={18} />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}





