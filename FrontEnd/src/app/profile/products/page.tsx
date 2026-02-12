"use client"
import { useEffect, useState } from "react"
import { GetUserProducts } from "@/lib/api/products/useGetUserProducts"
import { Product, UserProducts } from "@/lib/types/types"
import ProductCard from "@/features/components/productCard"
import { useRouter } from "next/navigation";
export default function ProfileProductPage() {

  const router = useRouter();

  useEffect(() => {
    // localStorage'dan user bilgisi al
    const user = localStorage.getItem("user"); // veya kullandığınız key
    if (!user) {
      router.push("/login"); // user yoksa login sayfasına yönlendir
    }
  }, [router]);

  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: UserProducts = await GetUserProducts()
        setProducts(data.data.products)
      } catch (err) {
        console.error(err)
        setProducts([])
      }
    }
    fetchData();
  }, []
  );
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Ürünlerim</h1>
      {products?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
          {products?.map((product) => (

            <ProductCard key={product.id} product={product} edit={true} />

          ))}
        </div>
      ) : (<p className="text-center border border-gray-200 rounded-lg mt-4 p-6 text-sm text-gray-500 bg-white">Henüz ürün eklemediniz.</p>)
      }
    </main>
  )
}