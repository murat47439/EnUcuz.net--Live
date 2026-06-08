"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/api/products/useGetProducts";
import { PaginationRequest, Product } from "@/lib/types/types";
import ProductCard from "@/features/components/productCard";
import PageLoader from "@/features/components/pageLoader";

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(false);
        const request: PaginationRequest = {
          page: 1,
          category: categoryId || 0,
        };
        const data = await getProducts(request);
        const allProducts = data.products || [];
        const filteredProducts = allProducts.filter(
          (p) => p.id !== currentProductId
        );
        setProducts(filteredProducts.slice(0, 8));
      } catch (err) {
        console.error("İlgili ürünler yüklenirken hata:", err);
        setError(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  // Her zaman bölümü göster
  return (
    <div className="mt-4 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Benzer Ürünler
        </h2>

        {loading ? (
          <PageLoader fullPage={false} size="sm" label="Benzer ürünler" />
        ) : error || products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Bu kategoride başka ürün bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
