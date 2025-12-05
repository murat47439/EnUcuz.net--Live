"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Button from "./button";
import Link from "next/link";
import { ProductDetail } from "@/lib/types/types";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductDetailCardProps {
    product: ProductDetail
}

const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 sm:p-6 md:p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Resim Galerisi - Ana Resim + Alt Thumbnails */}
            <div className="flex flex-col items-center">
                <div className="flex flex-col gap-3 w-full">
                    {/* Ana Resim */}
                    <div 
                        className="relative w-full"
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <div
                            ref={mainImageRef}
                            className="relative w-full aspect-square max-h-[400px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group cursor-zoom-in"
                        >
                            <Image
                                src={allImages[selectedImageIndex]}
                                alt={product?.data.product?.name || "Ürün resmi"}
                                fill
                                sizes="(max-width: 1024px) 100vw, 66vw"
                                className={`object-contain transition-transform duration-300 ${
                                    isZoomed ? "scale-150" : "scale-100"
                                }`}
                                priority
                            />
                            
                            {/* Zoom İkonu */}
                            {isZoomed && (
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                    <ZoomIn size={20} className="text-gray-700" />
                                </div>
                            )}

                            {/* Resim Sayısı Badge */}
                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                                    {selectedImageIndex + 1} / {allImages.length}
                                </div>
                            )}

                            {/* Önceki/Sonraki Butonları - Sadece birden fazla resim varsa */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => 
                                            prev > 0 ? prev - 1 : allImages.length - 1
                                        )}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                        aria-label="Önceki resim"
                                    >
                                        <ChevronLeft size={24} className="text-gray-700" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImageIndex((prev) => 
                                            prev < allImages.length - 1 ? prev + 1 : 0
                                        )}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                        aria-label="Sonraki resim"
                                    >
                                        <ChevronRight size={24} className="text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Listesi - Ana resmin altında */}
                    {allImages.length > 1 && (
                        <div className="w-full">
                            <div 
                                ref={thumbnailContainerRef}
                                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent justify-center"
                            >
                                {allImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                            selectedImageIndex === index
                                                ? "border-gray-700 ring-1 ring-gray-300 scale-105"
                                                : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`Ürün görseli ${index + 1}`}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                        {selectedImageIndex === index && (
                                            <div className="absolute inset-0 bg-gray-900/5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fiyat ve Özellikler */}
            <div>
                <p className="text-gray-900 font-bold text-xl mb-3 text-center">
                    {product.data.product.price
                        ? ((Number(product.data.product.price) / 100).toFixed(2) + " ₺")
                        : "Fiyat bilgisi yok"}
                </p>

                {product?.data.attribute && product.data.attribute.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300  scrollbar-track-transparent pr-2">
                        {product.data.attribute.map((attr, index) => (
                            <div 
                                key={index} 
                                className="group bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                            <svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">
                                            {attr.attribute_name}
                                        </span>
                                        <span className="text-sm font-medium text-gray-700  break-words block">
                                            {attr.value}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 bg-gray-50  rounded-xl border-2 border-dashed border-gray-300 ">
                        <svg className="w-10 h-10 mx-auto text-gray-400 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-gray-400  text-sm">Özellik bilgisi yok.</p>
                    </div>
                )}
            </div>

            {/* Satıcı Bilgileri */}
            <div className="flex flex-col items-center gap-2 h-auto w-full pt-2">
                <h3 className="font-semibold text-gray-900">Satıcı Bilgileri</h3>
                <br></br>
                <p className="text-gray-600">{product.data.product.seller_name}</p>

                <Link href={`tel:${product.data.product.seller_phone}`}>
                    <Button className="bg-gray-900 hover:bg-gray-800 text-white font-medium w-full p-4 rounded-lg">
                        İletişime Geç
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductDetailCard;
