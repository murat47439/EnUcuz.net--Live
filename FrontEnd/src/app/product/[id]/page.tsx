import { getProduct } from "@/lib/api/products/useGetProduct";
import ProductDetailCard from "@/features/components/productDetailCard";
import { notFound } from "next/navigation";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";

export default async function ProductDetailPage({params} : {params : {id : number}}) {
    const resolvedParams = await params; // async olarak çöz
    const request: IdParam = { id: Number(resolvedParams.id) };

    const product = await getProduct(request)
    if(!product){
        notFound()
    }
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-center mb-6 tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">{String(product.data.Product.name) }</h1>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Link href={{pathname: "/",
                query: { category: product.data.Product.category_id },
                }} className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1">
                {product.data.Product.category_name}
                </Link>
                 <Link href={{pathname: "/",
                    query: { brand: product.data.Product.brand_id },}} className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1">{product.data.Product.brand_name}</Link>
            </div>

            <ProductDetailCard product={product}/>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div>
                    <h2 className="font-semibold text-center">Açıklama</h2>
                    <p className="px-6 py-4 text-gray-700">{product.data.Product.description}</p>
                </div>
                <div className="border-l hidden sm:block w-0.5 border-gray-100"></div>
                <div>
                    <h2 className="font-semibold text-center">Ürün Resimleri</h2>
                </div>
            </div>
        </main>
    );
} 