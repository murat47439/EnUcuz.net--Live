import { useToast } from "@/context/toastContext";
import React from "react";
import Image from "next/image";
import { Product } from "@/lib/types/types";
import { LucideHeart, HeartMinus, PencilIcon } from "lucide-react";
import { addFavorite } from "@/lib/api/favorites/useAdd";
import { removeFavorite } from "@/lib/api/favorites/useRemove";
import { IdParam } from "@/lib/types/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface ProductCardProps {
    product: Product;
    favori?: boolean;
    edit?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, favori = false, edit = false }) => {
    
   const {showNotification} = useToast();
    const router = useRouter()
    const addFavori = async (data: Product) => {
        try{
            if (data.id == 0) return;
            await addFavorite(data)
            showNotification('Ürün favorilere başarıyla eklendi.', 'success', 4000); // 4 saniye kalsın
        }catch(err){
            if (err instanceof Error) console.log(err);
            showNotification('' + err, 'error');
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
        <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          {/* Favori Butonu */}
          {favori ? (
            <button
              type="button"
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all z-10"
              onClick={(e) => {
                e.preventDefault();
                removeFavori(product.id || 0);
              }}
            >
              <HeartMinus size={16} className="text-red-500" />
            </button>
          ) : (
            <button
              type="button"
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg transition-all z-10"
              onClick={(e) => {
                e.preventDefault();
                addFavori(product);
              }}
            >
              <LucideHeart size={16} className="text-gray-600 hover:text-red-500 transition-colors" />
            </button>
          )}
        
          {/* Düzenle Butonu */}
          {edit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/profile/products/edit/${product.id}`);
              }}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-lg bg-white/95 backdrop-blur-sm hover:bg-green-50 hover:border-green-300 transition-all z-10 shadow-sm"
            >
              <PencilIcon className="w-3 h-3" />
              <span>Düzenle</span>
            </button>
          )}
        
          {/* Ürün Link */}
          <Link key={product.id} href={`/product/${product.id}`} className="block">
            <div className="flex flex-col h-full">
              {/* Görsel */}
              <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <Image
                  src={product?.image_url || "/placeholder.png"}
                  alt={product?.name}
                  width={200}
                  height={150}
                  className="object-contain w-full h-full p-2 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
        
              {/* İçerik */}
              <div className="p-2.5 flex flex-col flex-1">
                <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight mb-2 min-h-[2.5rem]">
                  {product.name}
                </p>
        
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold px-2 py-1 border border-blue-100">
                    {product.price ? ((Number(product.price) / 100).toFixed(2) + " ₺") : "Fiyat yok"}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[80px]">
                    {product.seller_name}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
    );
};

export default ProductCard;
