"use client"
import React, { useEffect, useState, useCallback } from "react";
import { GetBidderOffers } from "@/lib/api/offers/useGetBidder";
import { UpdateOffer } from "@/lib/api/offers/useUpdate";
import { AddCounter } from "@/lib/api/offers/useAddCounter";
import { UseModal } from "@/context/modalContext";
import { getProduct } from "@/lib/api/products/useGetProduct";
import { useRouter } from "next/navigation";
import { Offers, OffersModel, Product } from "@/lib/types/types";
import { useToast } from "@/context/toastContext";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/authContext";
import { formatDate, formatPrice } from "@/features/components/format";
import getOfferStatus from "@/features/components/status";
import CounterOfferForm from "@/features/components/UI/Offer/counterOffer";


import {
    ArrowLeft,

    CheckCircle2,
    XCircle,
    Ban,



    CalendarDays,

    TrendingUp,
    MessageCircle
} from "lucide-react";






/* ── Ana Sayfa ── */
export default function OfferBidderPage() {
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
        if (authLoading || !user) return; // Wait for auth

        try {
            setLoading(true);
            const data: Offers = await GetBidderOffers();
            const fetchedOffers = data.data.offers || [];

            // En yeni en üstte
            fetchedOffers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOffers(fetchedOffers);

            // Benzersiz ürün ID'lerini al ve ürün detaylarını çek
            const productIds = Array.from(new Set(fetchedOffers.map(o => o.productId)));
            const newProductsMap: Record<number, Product> = {};

            // Batch processing (5'li gruplar halinde)
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
    const handleCancel = async (id: number) => {
        try {
            await UpdateOffer({ id, action: "cancel" });
            showNotification("Teklif başarıyla iptal edildi.", "info", 3000);
            fetchOffers();
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Bir hata oluştu", "error", 4000);
        }
    };

    const handleAcceptCounter = async (id: number) => {
        try {
            await UpdateOffer({ id, action: "accept" });
            showNotification("Karşı teklif kabul edildi!", "success", 3000);
            fetchOffers();
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Bir hata oluştu", "error", 4000);
        }
    };

    const handleRejectCounter = async (id: number) => {
        try {
            await UpdateOffer({ id, action: "reject" });
            showNotification("Karşı teklif reddedildi.", "info", 3000);
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
                        <h1 className="text-2xl font-bold text-gray-900">Sunduğum Teklifler</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Satıcılara ilettiğiniz tüm tekliflerin durumunu buradan takip edebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* ── Teklif Listesi ── */}
                {offers.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {offers.map((offer) => {
                            const status = getOfferStatus(offer.status, offer.expiresAt);
                            /* İptal: Teklifi ben oluşturdum ve hala bekliyor */
                            const isMyOffer = user?.id !== null && Number(offer.createdBy) === Number(user?.id);
                            const canCancel = offer.status === 0 && isMyOffer;

                            /* Karşı teklif: Satıcı oluşturmuş (createdBy !== ben), ben yanıtlamalıyım */
                            const canRespondCounter = (offer.status === 0 || offer.status === 5) && !isMyOffer;
                            const product = productsMap[offer.productId];

                            return (
                                <div key={offer.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
                                    <div className="flex flex-col md:flex-row">

                                        {/* Ürün Bilgisi Sol Panel */}
                                        <div className="w-full md:w-48 bg-gray-50 p-4 flex flex-row md:flex-col items-center gap-3 border-b md:border-b-0 md:border-r border-gray-100">
                                            {product ? (
                                                <Link href={`/product/${product.slug}-p-${offer.productId}`} className="block relative w-16 h-16 md:w-24 md:h-24 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
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
                                                    <Link href={`/product/${product.slug}-p-${offer.productId}`} className="text-sm font-semibold text-gray-900 hover:text-[#ff6000] line-clamp-2 transition-colors">
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
                                                            <span className="text-sm text-gray-500">Satıcı:</span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {offer.sellerName}
                                                            </span>
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
                                                                {canRespondCounter ? "Yanıtlamanız Gerekiyor" : "Yanıt Bekleniyor"}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Aksiyonlar */}
                                            {/* Bekleyen — kendi oluşturduğum teklifi iptal edebilirim */}
                                            {canCancel && (
                                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                                    <div className="w-full mb-2">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                                            Sizin Teklifiniz
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCancel(offer.id)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Ban size={15} />
                                                        Teklifi İptal Et
                                                    </button>
                                                </div>
                                            )}

                                            {/* Karşı teklif — satıcı oluşturmuş, ben yanıtlamalıyım */}
                                            {canRespondCounter && (
                                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-gray-200 text-gray-700 uppercase tracking-wide">
                                                                    Satıcı
                                                                </span>
                                                                <p className="text-xs text-gray-600 font-medium">
                                                                    Karşı teklif gönderdi
                                                                </p>
                                                            </div>
                                                            <p className="text-lg font-bold text-gray-900 mt-0.5">
                                                                {formatPrice(offer.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleAcceptCounter(offer.id)}
                                                            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                                        >
                                                            <CheckCircle2 size={15} />
                                                            Kabul Et
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectCounter(offer.id)}
                                                            className="min-w-[100px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                                                        >
                                                            <XCircle size={15} />
                                                            Reddet
                                                        </button>
                                                        <button
                                                            onClick={() => openCounterModal(offer)}
                                                            className="min-w-[120px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-[#ff6000] border border-orange-200 hover:bg-[#fff4ed] transition-colors"
                                                        >
                                                            <TrendingUp size={15} />
                                                            Karşı Teklif
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Kabul Edildi — satıcıdan mesaj bekleniyor */}
                                            {offer.status === 1 && (
                                                <div className="pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <MessageCircle size={16} className="text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-blue-800">Teklif Kabul Edildi</p>
                                                            <p className="text-xs text-blue-600 mt-0.5">Satıcıdan mesaj bekleyiniz.</p>
                                                        </div>
                                                    </div>
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
                            Henüz teklif göndermediniz
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            Beğendiğiniz ürünlere teklif vererek alışverişe başlayabilirsiniz.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}