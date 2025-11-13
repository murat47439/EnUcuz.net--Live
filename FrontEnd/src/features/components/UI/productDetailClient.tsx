"use client";
import Image from "next/image";
import { UseModal } from "@/context/modalContext";
import { ProductDetail } from "@/lib/types/types";

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const { openModal, closeModal } = UseModal();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.isArray(product.data.product.image_urls) &&
      product.data.product.image_urls.length > 0 ? (
        product.data.product.image_urls.map((image: string, index: number) => (
          <div
            key={index}
            className="relative group aspect-square rounded-xl overflow-hidden border border-gray-300"
          >
            <Image
              src={image}
              alt={`Ürün görseli ${index + 1}`}
              width={400}
              height={400}
              className="object-contain w-full h-full cursor-pointer"
              onClick={() =>
                openModal(
                  <div className="relative">
                    <Image
                      src={image}
                      alt="Ürün resmi"
                      width={600}
                      height={600}
                      className="object-contain"
                    />
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 px-3 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Kapat
                    </button>
                  </div>
                )
              }
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500">Bu ürün için görsel bulunmamaktadır.</p>
      )}
    </div>
  );
}
