import { getProduct } from "@/lib/api/products/useGetProduct";
import ProductDetailCard from "@/features/components/productDetailCard";
import { notFound } from "next/navigation";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";
import ProductDetailSection from "@/features/components/UI/productDetail/productDetailSection";
import RelatedProducts from "@/features/components/UI/productDetail/relatedProducts";
import { Tag, Building2 } from "lucide-react";

export default async function ProductDetailPage({params} : {params : {id : number}}) {
    const resolvedParams = await params; // async olarak çöz
    const request: IdParam = { id: Number(resolvedParams.id) };
    const product = await getProduct(request)
    if(!product){
        notFound()
    }
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto sm:px-4 py-6 md:py-8 max-w-7xl">
                {/* Başlık ve Etiketler */}
                <div className="mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 tracking-tight text-gray-900">
                            {String(product.data.product.name)}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link 
                                href={`/?category=${product.data.product.category_id}`}
                                className="inline-flex items-center gap-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-200 transition-colors duration-200"
                            >
                                <Tag size={16} />
                                {product.data.product.category_name}
                            </Link>
                            <Link 
                                href={`/?brand=${product.data.product.brand_id}`}
                                className="inline-flex items-center gap-2 rounded-md bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 hover:bg-gray-200 transition-colors duration-200"
                            >
                                <Building2 size={16} />
                                {product.data.product.brand_name}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ürün Detay Kartı */}
                <div className="mb-8">
                    <ProductDetailCard product={product}/>
                </div>

                {/* Açıklama Bölümü */}
                <ProductDetailSection product={product} />

                {/* Şunları da Beğenebilirsiniz */}
                <RelatedProducts 
                    categoryId={product.data.product.category_id} 
                    currentProductId={product.data.product.id || 0}
                />
            </div>
        </main>
    );
} 