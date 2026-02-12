"use client";

import dynamic from "next/dynamic";
import { ProductDetail } from "@/lib/types/types";

const ProductDescription = dynamic(
  () => import("./productDescription"),
  { ssr: false }
);

interface ProductDetailSectionProps {
  product: ProductDetail;
}

export default function ProductDetailSection({ product }: ProductDetailSectionProps) {
  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Ürün Açıklaması</h2>
        <div className="text-gray-700 text-sm leading-relaxed [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_iframe]:w-full [&_iframe]:aspect-video">
          <ProductDescription description={product.data.product.description} />
        </div>
      </div>
    </div>
  );
}
