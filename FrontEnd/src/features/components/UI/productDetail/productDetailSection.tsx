"use client";

import dynamic from "next/dynamic";
import { ProductDetail } from "@/lib/types/types";

const ProductDetailClient = dynamic(
  () => import("./productDetailClient"),
  { ssr: false }
);

const ProductDescription = dynamic(
  () => import("./productDescription"),
  { ssr: false }
);

interface ProductDetailSectionProps {
  product: ProductDetail;
}

export default function ProductDetailSection({ product }: ProductDetailSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 bg-white  rounded-2xl border border-gray-200  shadow-xl p-6 md:p-8">
      {/* Açıklama Bölümü */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 ">Ürün Resimleri</h2>
        </div>
        <ProductDetailClient product={product}/>
      </div>

      {/* Ayırıcı Çizgi */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-300  to-transparent"></div>

      {/* Ürün Resimleri Bölümü */}
      

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 ">Açıklama</h2>
        </div>
        <div className="bg-gray-50  rounded-xl p-5 md:p-6 border border-gray-200 ">
          <ProductDescription description={product.data.product.description} />
        </div>
      </div>
    </div>
  );
}

