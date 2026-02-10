"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "./button";
import Link from "next/link";
import { ProductDetail } from "@/lib/types/types";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Store,
    ShieldCheck,
    Tag,
    Share2,
    Heart,
    AlertCircle,
    Gavel
} from "lucide-react";
import { UseModal } from "@/context/modalContext";
import Input from "./input";
import { useToast } from "@/context/toastContext";
import { useForm } from "react-hook-form";
import { NewOffer } from "@/lib/types/types";
import { AddOffer } from "@/lib/api/offers/useAddOffers";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
interface ProductDetailCardProps {
    product: ProductDetail
}

type FormData = {
    price: number
}

const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);
    const { openModal, closeModal } = UseModal();
    const { showNotification } = useToast();
    const router = useRouter()
    const { user, isLoading } = useAuth();


    // Tüm resimleri birleştir (image_url + image_urls)
    const allImages = React.useMemo(() => {
        const images: string[] = [];
        if (product?.data.product.image_url) {
            images.push(product.data.product.image_url);
        }
        if (Array.isArray(product?.data.product.image_urls)) {
            product.data.product.image_urls.forEach((url: string) => {
                if (url && !images.includes(url)) {
                    images.push(url);
                }
            });
        }
        return images.length > 0 ? images : ["/placeholder.png"];
    }, [product]);

    // Mouse ile zoom
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed || !mainImageRef.current) return;

        const rect = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const img = mainImageRef.current.querySelector("img");
        if (img) {
            img.style.transformOrigin = `${x}% ${y}%`;
        }
    };

    // Klavye ile navigasyon
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (allImages.length <= 1) return;

            if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : allImages.length - 1
                );
            } else if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) =>
                    prev < allImages.length - 1 ? prev + 1 : 0
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [allImages.length]);

    const methods = useForm<FormData>({
        defaultValues: {
            price: product.data.product.price / 100
        }
    })

    const { register, handleSubmit } = methods;

    const onsubmit = async (data: FormData) => {
        if (!isLoading && !user) {
            closeModal()
            router.push("/login")
        }
        if (data.price < (product.data.product.price * 0.6 / 100)) {
            showNotification("Teklif fiyatı çok düşük. Minimum teklif sınırının altındasınız.", "error");
            return;
        }

        const priceInCents = Math.round(data.price * 100);

        const request: NewOffer = {
            price: priceInCents,
            productId: Number(product.data.product.id),
        }

        try {
            const response = await AddOffer(request)
            if (response.success) {
                showNotification('Teklif başarıyla iletildi', 'success', 3000)
            }
        } catch (err) {
            console.error(err)
            if (err instanceof Error) {
                showNotification(err.message || 'Teklif verilemedi', 'error', 3000)
            } else {
                showNotification('Teklif verilemedi', 'error', 3000)
            }
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price / 100);
    }

    // Modal İçeriği - renderModalContent olarak ayırabiliriz ama inline daha basit şu an
    const renderOfferModal = () => (
        <div className="p-1">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                    <Gavel className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Teklif Ver</h2>
                    <p className="text-sm text-gray-500">Bu ürün için fiyat teklifi oluşturun</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-blue-800 font-medium">Liste Fiyatı</span>
                        <span className="text-lg font-bold text-blue-900">{formatPrice(product.data.product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-600">Min. Teklif Tutarı (%60)</span>
                        <span className="text-sm font-semibold text-blue-700">{formatPrice(product.data.product.price * 0.6)}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teklifiniz (₺)</label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="text-lg font-semibold"
                        {...register("price")}
                    />
                </div>

                <div className="flex flex-row gap-3 pt-4">
                    <Button type='button' onClick={closeModal} className='flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'>
                        Vazgeç
                    </Button>
                    <Button
                        type='button'
                        onClick={handleSubmit(async (data) => {
                            await onsubmit(data);
                            closeModal();
                        })}
                        className='flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200'
                    >
                        Teklifi Gönder
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
                {/* ─── SOL KOLON: MEDYA GALERİSİ ─── */}
                <div className="p-6 lg:p-8 bg-gray-50/50 flex flex-col gap-6">
                    {/* Ana Resim */}
                    <div
                        className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group"
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <div ref={mainImageRef} className="w-full h-full relative cursor-zoom-in">
                            <Image
                                src={allImages[selectedImageIndex]}
                                alt={product?.data.product?.name || "Ürün resmi"}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className={`object-contain p-4 transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
                                priority
                            />
                        </div>

                        {/* Zoom İkonu */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <ZoomIn size={20} className="text-gray-600" />
                        </div>

                        {/* Resim Sayacı */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                {selectedImageIndex + 1} / {allImages.length}
                            </div>
                        )}

                        {/* Navigasyon Butonları */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : allImages.length - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setSelectedImageIndex((prev) => prev < allImages.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Listesi */}
                    {allImages.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                            {allImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`flex-shrink-0 relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start ${selectedImageIndex === index
                                        ? "border-purple-600 ring-2 ring-purple-100 shadow-md transform -translate-y-0.5"
                                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                                        }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`Görsel ${index + 1}`}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── SAĞ KOLON: DETAYLAR ─── */}
                <div className="p-6 lg:p-8 flex flex-col h-full">



                    {/* Ürün Başlığı */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                        {product.data.product.name}
                    </h1>



                    {/* Fiyat Alanı */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">Satış Fiyatı</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {formatPrice(product.data.product.price)}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                                <ShieldCheck size={14} />
                                Güvenli Ödeme
                            </div>
                        </div>
                    </div>

                    {/* Satıcı Kartı */}
                    <div className="mb-8 flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-50 rounded-full flex items-center justify-center border border-purple-100 text-purple-600">
                            <Store size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Satıcı</p>
                            <h3 className="text-base font-bold text-gray-900">
                                {product.data.product.seller_name || "Bilinmeyen Satıcı"}
                            </h3>
                        </div>

                    </div>

                    {/* Aksiyon Butonu */}
                    <div className="mb-8">
                        <Button
                            onClick={() => openModal(renderOfferModal)}
                            className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-xl shadow-xl shadow-gray-200 flex items-center justify-center gap-3 text-lg font-bold transition-transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <Gavel size={20} />
                            Teklif Ver
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                            <AlertCircle size={12} />
                            Teklifiniz satıcı onayına sunulacaktır.
                        </p>
                    </div>

                    {/* Özellikler */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                            Ürün Özellikleri
                        </h3>
                        {product?.data.attribute && product.data.attribute.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.data.attribute.map((attr, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 border border-gray-100 rounded-lg p-3 hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
                                    >
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">
                                            {attr.attribute_name}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                                            {attr.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">Bu ürün için özellik belirtilmemiş.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailCard;
