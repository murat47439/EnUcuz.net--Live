import Link from "next/link";
import Button from "@/features/components/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Search className="text-gray-500" size={28} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">404</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Sayfa Bulunamadı</h2>
          <p className="text-sm text-gray-500">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        <Link href="/">
          <Button className="flex items-center justify-center gap-2 bg-[#ff6000] hover:bg-[#e55500] text-white">
            <Home size={16} />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </div>
    </div>
  );
}
