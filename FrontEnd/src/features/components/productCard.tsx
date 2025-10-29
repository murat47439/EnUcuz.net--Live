import { useToast } from "@/context/toastContext";
import React from "react";
import Image from "next/image";
import { Product } from "@/lib/types/types";
import { LucideHeart, HeartMinus } from "lucide-react";
import { addFavorite } from "@/lib/api/favorites/useAdd";
import { removeFavorite } from "@/lib/api/favorites/useRemove";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";
interface ProductCardProps {
    product: Product;
    favori?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, favori = false }) => {
    
   const {showNotification} = useToast();

    const addFavori = async (data: Product) => {
        try{
            if (data.id == 0) return;
            await addFavorite(data)
            showNotification('Ürün favorilere başarıyla eklendi.', 'success', 4000); // 4 saniye kalsın
        }catch(err){
            if (err instanceof Error) console.log(err);
            showNotification('Hata oluştu: Ürün eklenemedi.' + err, 'error');
        }
    }

    const removeFavori = async (id : number ) => {
        try{
            if (id == 0) return;
            const request : IdParam = {
                id: id
            }
            await removeFavorite(request)
            showNotification('Ürün favorilerden silindi', 'success', 4000)
        }catch(err){
            if (err instanceof Error) console.log(err);
            showNotification('Hata oluştu: Ürün silinemedi.' + err, 'error')
        }
    }
    return (
        
        <Link key={product.id} href={`/product/${product.id}`}>
        <div className="rounded-2xl p-[1px] bg-gradient-to-b from-indigo-200/50 to-blue-100/40">
        <div className="group flex flex-col max-w-full rounded-2xl p-4 h-full relative border border-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:-translate-y-1">
         {favori ? (
            
            <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow transition"
                onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFavori(product.id || 0);
                }}
            >
                <HeartMinus color="black" />
            </button>
            ) : (
            <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur hover:bg-white shadow transition"
                onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addFavori(product);
                }}
            >
                <LucideHeart />
            </button>
        )}

            <div className="flex justify-center items-center w-full h-40 md:h-48 overflow-hidden rounded-lg bg-gradient-to-b from-slate-50 to-white">
                <Image
                src={product?.image_url || "/placeholder.png"}
                alt={product?.name}
                width={150}
                height={100}
                className="rounded-lg object-contain ring-1 ring-gray-100 w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
                </div>
            <p className="font-semibold text-gray-900 mt-3 max-w-full line-clamp-2 leading-snug">{product.name}</p>
            <div className="mt-3 flex justify-between w-full items-center">
                <p className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 shadow-sm">
                {product.price ? String(product.price / 100 ) + " ₺" : "Fiyat bilgisi yok"}
                </p>
                <p className="text-sm text-gray-500">{product.seller_name}</p>
            </div>
            
        </div>
        </div>
        </Link>
    );
};

export default ProductCard;
