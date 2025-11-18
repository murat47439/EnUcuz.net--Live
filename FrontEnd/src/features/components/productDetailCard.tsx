import React from "react";
import Image from "next/image";
import Button from "./button";
import Link from "next/link";
import { ProductDetail } from "@/lib/types/types";

interface ProductDetailCardProps {
    product: ProductDetail
}

const ProductDetailCard: React.FC<ProductDetailCardProps> = ({ product }) => {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 sm:p-6 md:p-8 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center">
                <Image
                    src={product?.data.product.image_url || "/placeholder.png"}
                    alt={product?.data.product?.name || "Ürün resmi"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    width={300}
                    height={200}
                    className="rounded-lg ring-1 ring-gray-100"
                />
            </div>

            
            <div>
                <p className="text-blue-600 font-extrabold text-xl mb-3 text-center">
                    {product.data.product.price
                        ? product.data.product.price + " ₺"
                        : "Fiyat bilgisi yok"}
                </p>

                {product?.data.attribute && product.data.attribute.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300  scrollbar-track-transparent pr-2">
                        {product.data.attribute.map((attr, index) => (
                            <div 
                                key={index} 
                                className="group bg-gradient-to-r from-gray-50 to-white   border border-gray-200  rounded-xl p-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-6 h-6 rounded-md bg-blue-100  flex items-center justify-center group-hover:bg-blue-200  transition-colors">
                                            <svg className="w-3.5 h-3.5 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-blue-600  uppercase tracking-wide block mb-1">
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

            
            <div className="flex flex-col items-center gap-2 h-auto w-full pt-2">
                <h3 className="font-semibold text-gray-900">Satıcı Bilgileri</h3><br></br>
                <p className="text-gray-600">{product.data.product.seller_name}</p>

                
                <Link href={`tel:${product.data.product.seller_phone}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full p-4 rounded-xl">
                        İletişime Geç
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductDetailCard;
