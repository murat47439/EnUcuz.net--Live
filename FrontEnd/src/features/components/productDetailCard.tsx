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
                    src={product?.data.Product.image_url || "/placeholder.png"}
                    alt={product?.data.Product?.name || "Ürün resmi"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                    width={300}
                    height={200}
                    className="rounded-lg ring-1 ring-gray-100"
                />
            </div>

            
            <div>
                <p className="text-blue-600 font-extrabold text-xl mb-3 text-center">
                    {product.data.Product.price
                        ? product.data.Product.price + " ₺"
                        : "Fiyat bilgisi yok"}
                </p>

                {product?.data.Attribute && product.data.Attribute.length > 0 ? (
                    <ul className="list-none list-inside space-y-2">
                        {product.data.Attribute.map((attr, index) => (
                            <li key={index} className="text-gray-700 border border-gray-200 rounded-xl text-center p-3">
                                {attr.attribute_name}: {attr.value}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center">Özellik bilgisi yok.</p>
                )}
            </div>

            
            <div className="flex flex-col items-center gap-2 h-auto w-full pt-2">
                <h3 className="font-semibold text-gray-900">Satıcı Bilgileri</h3><br></br>
                <p className="text-gray-600">{product.data.Product.seller_name}</p>

                
                <Link href={`tel:${product.data.Product.seller_phone}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full p-4 rounded-xl">
                        İletişime Geç
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProductDetailCard;
