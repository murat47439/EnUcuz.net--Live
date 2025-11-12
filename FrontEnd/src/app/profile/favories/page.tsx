"use client"
import {useEffect, useState} from "react";
import { useToast } from "@/context/toastContext";
import { getFavourites } from "@/lib/api/favorites/useGet";
import { Favorites } from "@/lib/types/types";
import ProductCard from "@/features/components/productCard";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/types";

export default function FavoritePage(){

    const router = useRouter();

  useEffect(() => {
    // localStorage'dan user bilgisi al
    const user = localStorage.getItem("user"); // veya kullandığınız key
    if (!user) {
      router.push("/login"); // user yoksa login sayfasına yönlendir
    }
  }, [router]);

    const [products, setProducts] = useState<Product[]>([]);
    const {showNotification} = useToast()
    useEffect(()=>{
        const fetchData = async () =>{
            try{
              const data: Favorites = await getFavourites();
              setProducts(data.data.products || [])
            }catch(err){
                if (err instanceof Error) {
                setProducts([]);
                showNotification(err.message, 'error', 4000);
                }else{
                    showNotification('Bir hata oluştu', 'error', 4000)
                }
            }
        }
        fetchData();
    }, [showNotification]);
    return (
        <main className="container mx-auto px-4 py-8">
        <h1 className="text-center font-extrabold mb-6 text-xl"> Favori Ürünlerim </h1>
        { products?.length >0 ?(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
        {products?.map((product)=> (
         
          <ProductCard key={product.id} product={product} favori={true} />
          
        ))}  
      </div>  
      ):(<p className="text-center border rounded-2xl mt-8 p-4 text-gray-600">Henüz favorilere ürün yüklemediniz.</p>)
    }
    </main>
    )
}