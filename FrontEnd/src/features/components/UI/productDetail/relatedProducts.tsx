"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/api/products/useGetProducts";
import { PaginationRequest, Product } from "@/lib/types/types";
import ProductCard from "@/features/components/productCard";
import { Sparkles, Loader2 } from "lucide-react";

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const request: PaginationRequest = {
          page: 1,
          category: categoryId,
        };
        const data = await getProducts(request);

        const filteredProducts = (data.products || []).filter(
          (p) => p.id !== currentProductId
        );
        setProducts(filteredProducts.slice(0, 8));
      } catch (err) {
        console.error("İlgili ürünler yüklenirken hata:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-8">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
        {/* Başlık */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-md">
            <Sparkles className="text-gray-700" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Şunları da Beğenebilirsiniz</h2>
            <p className="text-sm text-gray-500">Aynı kategorideki diğer ürünler</p>
          </div>
        </div>

        {/* Ürün Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

