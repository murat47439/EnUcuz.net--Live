"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "./button";
import { ProductDetail } from "@/lib/types/types";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    Store,
    ShieldCheck,
    Share2,
    Heart,
    AlertCircle,
    Gavel,
    Truck,
    Package
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
    const [isFav, setIsFav] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);
    const { openModal, closeModal } = UseModal();
    const { showNotification } = useToast();
    const router = useRouter()
    const { user, isLoading } = useAuth();

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (allImages.length <= 1) return;
            if (e.key === "ArrowLeft") {
                setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : allImages.length - 1);
            } else if (e.key === "ArrowRight") {
                setSelectedImageIndex((prev) => prev < allImages.length - 1 ? prev + 1 : 0);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [allImages.length]);

    const methods = useForm<FormData>({
        defaultValues: { price: product.data.product.price / 100 }
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

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showNotification('Link kopyalandı', 'success', 2000);
        } catch {
            showNotification('Link kopyalanamadı', 'error', 2000);
        }
    };

    const renderOfferModal = () => (
        <div className="p-1">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#fff4ed] rounded-lg flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-[#ff6000]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Teklif Ver</h2>
                    <p className="text-sm text-gray-500">Bu ürün için fiyat teklifi oluşturun</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-medium">Liste Fiyatı</span>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.data.product.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Min. Teklif (%60)</span>
                        <span className="text-sm font-semibold text-gray-600">{formatPrice(product.data.product.price * 0.6)}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teklifiniz (₺)</label>
                    <Input type="number" step="0.01" placeholder="0.00" className="text-lg font-semibold" {...register("price")} />
                </div>
                <div className="flex flex-row gap-3 pt-3">
                    <Button type='button' variant='secondary' onClick={closeModal} className='flex-1'>Vazgeç</Button>
                    <Button
                        type='button'
                        onClick={handleSubmit(async (data) => { await onsubmit(data); closeModal(); })}
                        className='flex-1 bg-[#ff6000] hover:bg-[#e55500] text-white'
                    >
                        Teklifi Gönder
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* SOL: Galeri */}
                <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                    {/* Thumbnails Sol + Ana Resim */}
                    <div className="flex gap-3">
                        {/* Dikey Thumbnail Listesi */}
                        {allImages.length > 1 && (
                            <div className="hidden sm:flex flex-col gap-1.5 w-16 flex-shrink-0">
                                {allImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                            ? "border-[#ff6000]"
                                            : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                                            }`}
                                    >
                                        <Image src={image} alt={`Görsel ${index + 1}`} fill sizes="64px" className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Ana Resim */}
                        <div
                            className="relative flex-1 aspect-square bg-white rounded-lg overflow-hidden border border-gray-100 group"
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

                            <div className="absolute top-3 right-3 bg-white/90 rounded-md p-1.5 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <ZoomIn size={16} className="text-gray-400" />
                            </div>

                            {allImages.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900/60 text-white text-[11px] font-medium px-2 py-0.5 rounded">
                                    {selectedImageIndex + 1} / {allImages.length}
                                </div>
                            )}

                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : allImages.length - 1)}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 rounded-full p-1.5 shadow border border-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => prev < allImages.length - 1 ? prev + 1 : 0)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 rounded-full p-1.5 shadow border border-gray-200 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobil Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex sm:hidden gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
                            {allImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`flex-shrink-0 relative w-14 h-14 rounded overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                        ? "border-[#ff6000]"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <Image src={image} alt={`Görsel ${index + 1}`} fill sizes="56px" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* SAĞ: Detaylar */}
                <div className="p-4 sm:p-6 flex flex-col">
                    {/* Satıcı */}
                    <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Store size={16} className="text-gray-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Satıcı</p>
                            <p className="text-sm font-semibold text-gray-900">{product.data.product.seller_name || "Bilinmeyen Satıcı"}</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button onClick={handleShare} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors" title="Paylaş">
                                <Share2 size={15} />
                            </button>
                            <button onClick={() => setIsFav(!isFav)} className={`p-2 rounded-lg border transition-colors ${isFav ? "border-red-200 text-red-500 bg-red-50" : "border-gray-200 text-gray-400 hover:text-red-500 hover:bg-gray-50"}`} title="Favorilere Ekle">
                                <Heart size={15} fill={isFav ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </div>

                    {/* Ürün Adı */}
                    <h1 className="text-xl font-bold text-gray-900 leading-snug mb-5">
                        {product.data.product.name}
                    </h1>

                    {/* Fiyat */}
                    <div className="mb-5 p-4 bg-[#fafafa] rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-1">Satış Fiyatı</p>
                        <p className="text-3xl font-bold text-[#ff6000] mb-2">
                            {formatPrice(product.data.product.price)}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Package size={12} className="text-green-600" /> Stokta</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-600" /> Güvenli Ödeme</span>
                            <span className="flex items-center gap-1"><Truck size={12} className="text-gray-400" /> Kargo</span>
                        </div>
                    </div>

                    {/* Teklif Ver */}
                    <div className="mb-5">
                        <Button
                            onClick={() => openModal(renderOfferModal)}
                            className="w-full h-12 bg-[#ff6000] hover:bg-[#e55500] text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                        >
                            <Gavel size={17} />
                            Teklif Ver
                        </Button>
                        <p className="text-center text-[11px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
                            <AlertCircle size={10} />
                            Teklifiniz satıcı onayına sunulacaktır
                        </p>
                    </div>

                    {/* Özellikler */}
                    {product?.data.attribute && product.data.attribute.length > 0 && (
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ürün Özellikleri</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {product.data.attribute.map((attr, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                            <td className="py-2.5 px-3 text-gray-500 font-medium w-2/5">{attr.attribute_name}</td>
                                            <td className="py-2.5 px-3 text-gray-900 font-semibold">{attr.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {(!product?.data.attribute || product.data.attribute.length === 0) && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="text-center py-5 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">Bu ürün için özellik belirtilmemiş.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailCard;
