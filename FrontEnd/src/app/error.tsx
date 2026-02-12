"use client";

import { useEffect } from "react";
import Button from "@/features/components/button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h1>
          <p className="text-sm text-gray-500 mb-3">
            Üzgünüz, bir şeyler ters gitti. Lütfen tekrar deneyin.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400">
              Hata Kodu: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            className="flex-1 bg-[#ff6000] hover:bg-[#e55500] text-white rounded-lg font-medium"
          >
            Tekrar Dene
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 rounded-lg font-medium"
            >
              <Home size={16} />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
