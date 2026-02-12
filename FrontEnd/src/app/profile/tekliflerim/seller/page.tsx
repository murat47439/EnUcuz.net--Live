"use client"
import React, { useEffect, useState, useCallback } from "react";
import { GetSellerOffers } from "@/lib/api/offers/useGetSeller";
import { UpdateOffer } from "@/lib/api/offers/useUpdate";
import { AddCounter } from "@/lib/api/offers/useAddCounter";
import { getProduct } from "@/lib/api/products/useGetProduct";
import { useRouter } from "next/navigation";
import { Offers, OffersModel, Product } from "@/lib/types/types";
import { useToast } from "@/context/toastContext";
import { UseModal } from "@/context/modalContext";
import { useAuth } from "@/context/authContext";
import { formatPrice, formatDate } from "@/features/components/format";
import Link from "next/link";
import Image from "next/image";
import getOfferStatus from "@/features/components/status";
import CounterOfferForm from "@/features/components/UI/Offer/counterOffer";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    TrendingUp,
    CalendarDays,
} from "lucide-react";




/* ── Ana Sayfa ── */
export default function OfferSellerPage() {
    const router = useRouter();
    const { showNotification } = useToast();
    const { openModal, closeModal } = UseModal();
    const [offers, setOffers] = useState<OffersModel[]>([]);
    const [productsMap, setProductsMap] = useState<Record<number, Product>>({});
    const [loading, setLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchOffers = useCallback(async () => {
        if (authLoading || !user) return;
        try {
            setLoading(true);
            const data: Offers = await GetSellerOffers();
            const fetchedOffers = data.data.offers || [];

            // Sıralama: En yeni teklifler en üstte
            fetchedOffers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOffers(fetchedOffers);

            // Benzersiz ürün ID'lerini al ve ürün detaylarını çek
            const productIds = Array.from(new Set(fetchedOffers.map(o => o.productId)));
            const newProductsMap: Record<number, Product> = {};

            // Batch processing (5'li gruplar halinde) - Backend yükünü azaltmak için
            const BATCH_SIZE = 5;
            for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
                const chunk = productIds.slice(i, i + BATCH_SIZE);
                await Promise.all(chunk.map(async (id) => {
                    try {
                        const pDetail = await getProduct({ id });
                        if (pDetail?.data?.product) {
                            newProductsMap[id] = pDetail.data.product;
                        }
                    } catch (e) {
                        console.error(`Product ${id} fetch error`, e);
                    }
                }));
                // Opsiyonel: Kısa bir bekleme süresi eklenebilir
                // await new Promise(resolve => setTimeout(resolve, 50));
            }

            setProductsMap(newProductsMap);

        } catch (err) {
            console.error(err);
            setOffers([]);
        } finally {
            setLoading(false);
        }
    }, [authLoading, user]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    /* ── Aksiyonlar ── */
    const handleAccept = async (id: number) => {
        try {
            await UpdateOffer({ id, action: "accept" });
            showNotification("Teklif kabul edildi!", "success", 3000);
            fetchOffers();
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Hata oluştu", "error", 4000);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await UpdateOffer({ id, action: "reject" });
            showNotification("Teklif reddedildi.", "info", 3000);
            fetchOffers();
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Hata oluştu", "error", 4000);
        }
    };

    const handleCounter = async (offerId: number, price: number) => {
        try {
            await AddCounter({ offerId, price });
            showNotification("Karşı teklif gönderildi.", "success", 3000);
            closeModal();
            fetchOffers();
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Hata oluştu", "error", 4000);
        }
    };

    const openCounterModal = (offer: OffersModel) => {
        openModal(
            <CounterOfferForm
                offer={offer}
                currentPrice={offer.price}
                onSubmit={handleCounter}
                onClose={closeModal}
            />
        );
    };

    /* ── Loading ── */
    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#ff6000] mb-3"></div>
                    <p className="text-sm text-gray-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col gap-8">
                {/* ── Header ── */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">

                        <button onClick={() => { router.push('/profile/tekliflerim') }}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Aldığım Teklifler</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Ürünlerinize gelen tüm teklifleri buradan yönetebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* ── Teklif Listesi ── */}
                {offers.length > 0 ? (
                    <div className="flex flex-col gap-5">
                        {offers.map((offer) => {
                            const status = getOfferStatus(offer.status, offer.expiresAt);
                            /* LOGIC: Aksiyon sadece teklifi ben oluşturmadıysam (veya sıra bendeyse) mümkündür */
                            /* NOT: String/Number uyuşmazlığını önlemek için Number() dönüşümü yapıyoruz */
                            const createdByMe = user?.id !== null && Number(offer.createdBy) === Number(user?.id);
                            console.log(createdByMe)
                            const canAct = (offer.status === 0 || offer.status === 5) && !createdByMe;
                            const product = productsMap[offer.productId];

                            return (
                                <div key={offer.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
                                    <div className="flex flex-col md:flex-row">

                                        {/* Ürün Bilgisi Sol Panel */}
                                        <div className="w-full md:w-48 bg-gray-50 p-4 flex flex-row md:flex-col items-center gap-3 border-b md:border-b-0 md:border-r border-gray-100">
                                            {product ? (
                                                <Link href={`/product/${offer.productId}`} className="block relative w-16 h-16 md:w-24 md:h-24 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={product.image_url || "/placeholder.png"}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                </Link>
                                            ) : (
                                                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                                            )}
                                            <div className="flex-1 min-w-0 md:text-center text-left">
                                                {product ? (
                                                    <Link href={`/product/${offer.productId}`} className="text-sm font-semibold text-gray-900 hover:text-[#ff6000] line-clamp-2 transition-colors">
                                                        {product.name}
                                                    </Link>
                                                ) : (
                                                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Teklif Detayları */}
                                        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm text-gray-500">Alıcı:</span>
                                                            <span className="text-sm font-bold text-gray-900">{offer.bidderName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <CalendarDays size={12} />
                                                            {formatDate(offer.createdAt)}
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${status.color}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase">Teklif Fiyatı</p>
                                                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatPrice(offer.price)}</p>
                                                    </div>
                                                    {status.label === "Karşı Teklif" && (
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Durum</p>
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {createdByMe ? "Yanıt Bekleniyor" : "Yanıtlamanız Gerekiyor"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Aksiyonlar */}
                                            {canAct && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-xs text-blue-600 font-medium">
                                                                    {offer.status === 5 ? "Karşı Teklif Gönderdi" : "Alıcı Teklif Gönderdi"}
                                                                </p>
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-700 mt-0.5">
                                                                {formatPrice(offer.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => handleAccept(offer.id)} className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
                                                            <CheckCircle2 size={16} />
                                                            Kabul Et
                                                        </button>
                                                        <button onClick={() => handleReject(offer.id)} className="min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                                                            <XCircle size={16} />
                                                            Reddet
                                                        </button>
                                                        <button onClick={() => openCounterModal(offer)} className="min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-[#ff6000] border border-orange-200 hover:bg-[#fff4ed] transition-colors">
                                                            <TrendingUp size={16} />
                                                            Karşı Teklif
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bilgi mesajı: Kendi teklifin ise */}
                                            {!canAct && (offer.status === 0 || offer.status === 5) && (
                                                <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                                                    <p className="text-xs text-gray-400 italic">
                                                        {createdByMe
                                                            ? "Teklifiniz karşı tarafta, yanıt bekleniyor."
                                                            : "Bu teklif için işlem yapamazsınız."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Boş Durum ── */
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-lg">

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Henüz teklif yok
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            Ürünlerinize henüz bir teklif gelmedi. Teklifler geldiğinde burada listelenecektir.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}