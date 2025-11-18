import { getProduct } from "@/lib/api/products/useGetProduct";
import ProductDetailCard from "@/features/components/productDetailCard";
import { notFound } from "next/navigation";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";
import ProductDetailSection from "@/features/components/UI/productDetail/productDetailSection";
export default async function ProductDetailPage({params} : {params : {id : number}}) {
    const resolvedParams = await params; // async olarak çöz
    const request: IdParam = { id: Number(resolvedParams.id) };
    const product = await getProduct(request)
    if(!product){
        notFound()
    }
    return (
        <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
            {/* Başlık ve Etiketler */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900    bg-clip-text text-transparent">
                    {String(product.data.product.name)}
                </h1>
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    <Link 
                        href={`/?category=${product.data.product.category_id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-blue-100   text-blue-700  text-sm font-semibold px-4 py-2 hover:from-blue-100 hover:to-blue-200 :from-blue-800/40 :to-blue-700/40 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        
                        {product.data.product.category_name}
                    </Link>
                    <Link 
                        href={`/?brand=${product.data.product.brand_id}`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-indigo-100   text-indigo-700  text-sm font-semibold px-4 py-2 hover:from-indigo-100 hover:to-indigo-200 :from-indigo-800/40 :to-indigo-700/40 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        
                        {product.data.product.brand_name}
                    </Link>
                </div>
            </div>

            {/* Ürün Detay Kartı */}
            <div className="mb-8">
                <ProductDetailCard product={product}/>
            </div>

            {/* Açıklama ve Görseller Bölümü */}
            <ProductDetailSection product={product} />
        </main>
    );
} 