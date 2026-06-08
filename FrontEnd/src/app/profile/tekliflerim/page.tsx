"use client"
import React, { useEffect } from "react";
import Link from "next/link";
import { Handshake, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";


import { useAuth } from "@/context/authContext";
import PageLoader from "@/features/components/pageLoader";

export default function OfferPage() {
    const router = useRouter()
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <PageLoader label="Yükleniyor" />;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="w-10 h-10 bg-[#fff4ed] rounded-lg flex items-center justify-center">
                        <Handshake className="text-[#ff6000] w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tekliflerim</h1>
                        <p className="text-gray-500 text-sm mt-1">Gelen ve giden tüm fiyat tekliflerinizi buradan yönetebilirsiniz.</p>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sunduğum Teklifler */}
                    <Link href="/profile/tekliflerim/bidder" className="group">
                        <div className="h-full bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 bg-[#fff4ed] rounded-lg flex items-center justify-center">
                                    <ArrowUpRight className="w-6 h-6 text-[#ff6000]" />
                                </div>
                                <div className="space-y-1.5">
                                    <h2 className="text-lg font-semibold text-gray-900">Sunduğum Teklifler</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Beğendiğiniz ürünler için satıcılara ilettiğiniz teklifleri görüntüleyin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Aldığım Teklifler */}
                    <Link href="/profile/tekliflerim/seller" className="group">
                        <div className="h-full bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <ArrowDownLeft className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <h2 className="text-lg font-semibold text-gray-900">Aldığım Teklifler</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Satıştaki ürünleriniz için gelen teklifleri inceleyin, kabul edin veya karşı teklif sunun.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}