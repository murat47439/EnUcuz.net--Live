"use client"
import React, {useEffect, useState} from "react"
import { GetUserProducts } from "@/lib/api/products/useGetUserProducts"
import { Product,UserProducts } from "@/lib/types/types"
import ProductCard from "@/features/components/productCard"
import { useRouter } from "next/navigation";
export default function ProfileProductPage(){

    const router = useRouter();

  useEffect(() => {
    // localStorage'dan user bilgisi al
    const user = localStorage.getItem("user"); // veya kullandığınız key
    if (!user) {
      router.push("/login"); // user yoksa login sayfasına yönlendir
    }
  }, [router]);
    
    const [products, setProducts] = useState<Product[]>([])

    useEffect(()=>{
        const fetchData = async () => {
            try{
                const data: UserProducts = await GetUserProducts()
                setProducts(data.data.Products)
            }catch(err){
                console.error(err)
                setProducts([])
            }
        }
        fetchData();
    },[]
);
return (
    <main className="container mx-auto px-4 py-8">
        <h1 className="text-center font-extrabold mb-6 text-xl"> Ürünlerim </h1>
        { products?.length >0 ?(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
        {products?.map((product)=> (
         
          <ProductCard key={product.id} product={product} />
          
        ))}  
      </div>  
      ):(<p className="text-center border rounded-2xl mt-8 p-4 text-gray-600">Henüz ürün yüklemediniz.</p>)
    }
    </main>
)
}
