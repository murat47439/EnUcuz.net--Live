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

    const { showNotification } = useToast();
    const router = useRouter()
    const addFavori = async (data: Product) => {
        try {
            if (data.id == 0) return;
            await addFavorite(data)
            showNotification('Ürün favorilere başarıyla eklendi.', 'success', 4000);
        } catch (err) {
            if (err instanceof Error) console.log(err);
            showNotification('' + err, 'error');
        }
    }

    const removeFavori = async (id: number) => {
        try {
            if (id == 0) return;
            const request: IdParam = {
                id: id
            }
            await removeFavorite(request)
            showNotification('Ürün favorilerden silindi', 'success', 4000)
        } catch (err) {
            if (err instanceof Error) console.log(err);
            showNotification('Hata oluştu: Ürün silinemedi.' + err, 'error')
        }
    }
    return (
        <div className="relative rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 group hover:shadow-md">
            {/* Favori Butonu */}
            {favori ? (
                <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all z-10"
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
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                        e.preventDefault();
                        addFavori(product);
                    }}
                >
                    <LucideHeart size={16} className="text-gray-500 hover:text-red-500 transition-colors" />
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
                    className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 rounded-md bg-white/95 hover:bg-gray-50 transition-all z-10 shadow-sm border border-gray-200"
                >
                    <PencilIcon className="w-3 h-3" />
                    <span>Düzenle</span>
                </button>
            )}

            {/* Ürün Link */}
            <Link key={product.id} href={`/product/${product.id}`} className="block">
                <div className="flex flex-col h-full">
                    {/* Görsel */}
                    <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-white">
                        <Image
                            src={product?.image_url || "/placeholder.png"}
                            alt={product?.name}
                            width={200}
                            height={150}
                            className="object-contain w-full h-full p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* İçerik */}
                    <div className="p-3 flex flex-col flex-1 border-t border-gray-50">
                        <p className="font-medium text-[13px] text-gray-800 line-clamp-2 leading-snug mb-3 min-h-[2.4rem]">
                            {product.name}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-2">
                            <span className="text-[#ff6000] text-base font-bold">
                                {product.price ? ((Number(product.price) / 100).toFixed(2) + " ₺") : "Fiyat yok"}
                            </span>
                            <span className="text-[11px] text-gray-400 truncate max-w-[80px]">
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