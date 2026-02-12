import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatPrice } from "../../format";
import { OffersModel } from "@/lib/types/types";
export default function CounterOfferForm({
    offer,
    currentPrice,
    onSubmit,
    onClose,
}: {
    offer: OffersModel;
    currentPrice: number;
    onSubmit: (offerId: number, price: number) => void;
    onClose: () => void;
}) {
    const [price, setPrice] = useState("");

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#fff4ed] rounded-lg flex items-center justify-center border border-orange-100">
                    <TrendingUp className="w-5 h-5 text-[#ff6000]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Karşı Teklif Gönder</h3>
                    <p className="text-sm text-gray-500">Teklif #{offer.id}</p>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1">
                <p className="text-xs text-gray-500 font-medium">Mevcut Teklif</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(currentPrice)}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Fiyat (₺)</label>
                <input
                    type="number"
                    min={1}
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Karşı teklif fiyatı girin..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Vazgeç
                </button>
                <button
                    onClick={() => {
                        const numPrice = Math.round(parseFloat(price) * 100);
                        if (!numPrice || numPrice <= 0) return;
                        onSubmit(offer.id, numPrice);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#ff6000] text-white text-sm font-medium hover:bg-[#e55500] transition-colors"
                >
                    Teklif Gönder
                </button>
            </div>
        </div>
    );
}