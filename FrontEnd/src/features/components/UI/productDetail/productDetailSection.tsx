"use client";

import dynamic from "next/dynamic";
import { ProductDetail } from "@/lib/types/types";
import { FileText } from "lucide-react";

const ProductDescription = dynamic(
  () => import("./productDescription"),
  { ssr: false }
);

interface ProductDetailSectionProps {
  product: ProductDetail;
}

export default function ProductDetailSection({ product }: ProductDetailSectionProps) {
  return (
    <div className="w-full py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        {/* Açıklama Başlık */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-md">
            <FileText className="text-gray-700" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Ürün Açıklaması</h2>
            <p className="text-sm text-gray-500">Ürün hakkında detaylı bilgiler</p>
          </div>
        </div>

        {/* Açıklama İçeriği */}
        <div className="bg-gray-50 rounded-lg border border-gray-100 p-6 md:p-8">
          <ProductDescription description={product.data.product.description} />
        </div>
      </div>
    </div>
  );
}

