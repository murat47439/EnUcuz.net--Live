import { getProduct } from "@/lib/api/products/useGetProduct";
import ProductDetailCard from "@/features/components/productDetailCard";
import { notFound } from "next/navigation";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";
import ProductDetailSection from "@/features/components/UI/productDetail/productDetailSection";
import RelatedProducts from "@/features/components/UI/productDetail/relatedProducts";
import { ChevronRight } from "lucide-react";

export default async function ProductDetailPage({ params }: { params: { id: number } }) {
    try {
        const resolvedParams = await params;
        const request: IdParam = { id: Number(resolvedParams.id) };
        if (!resolvedParams.id || isNaN(Number(resolvedParams.id))) {
            notFound();
        }

        const product = await getProduct(request);
        product.data.product.id = request.id
        if (!product || !product.data || !product.data.product) {
            notFound();
        }
        return (
            <main className="min-h-screen bg-[#fafafa]">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-[#ff6000] transition-colors">Anasayfa</Link>
                        <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                        <Link href={`/?category=${product.data.product.category_id}`} className="hover:text-[#ff6000] transition-colors">
                            {product.data.product.category_name}
                        </Link>
                        <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                        <Link href={`/?brand=${product.data.product.brand_id}`} className="hover:text-[#ff6000] transition-colors">
                            {product.data.product.brand_name}
                        </Link>
                        <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">
                            {String(product.data.product.name)}
                        </span>
                    </nav>

                    {/* Ürün Detay Kartı */}
                    <ProductDetailCard product={product} />

                    {/* Açıklama Bölümü */}
                    <ProductDetailSection product={product} />

                    {/* Benzer Ürünler */}
                    <RelatedProducts
                        categoryId={product.data.product.category_id}
                        currentProductId={product.data.product.id || 0}
                    />
                </div>
            </main>
        );
    } catch (error) {
        console.error("Product detail page error:", error);
        notFound();
    }
}