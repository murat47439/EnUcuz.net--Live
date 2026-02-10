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
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Karşı Teklif Gönder</h3>
                    <p className="text-sm text-gray-500">Teklif #{offer.id}</p>
                </div>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-1">
                <p className="text-xs text-purple-600 font-medium">Mevcut Teklif</p>
                <p className="text-xl font-bold text-purple-700">{formatPrice(currentPrice)}</p>
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                    className="flex-1 py-2.5 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                >
                    Teklif Gönder
                </button>
            </div>
        </div>
    );
}