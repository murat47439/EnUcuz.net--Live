"use client"
import React, { useEffect } from "react";
import Link from "next/link";
import { Handshake, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";


import { useAuth } from "@/context/authContext";

export default function OfferPage() {
    const router = useRouter()
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
                    <p className="text-sm text-gray-500">Yükleniyor...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                        <Handshake className="text-blue-600 w-6 h-6" />
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
                        <div className="h-full bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden">
                            <div className="flex flex-col gap-5 relative z-10">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300 shadow-sm">
                                    <ArrowUpRight className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Sunduğum Teklifler</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Beğendiğiniz ürünler için satıcılara ilettiğiniz teklifleri görüntüleyin, durumlarını takip edin.
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Icon */}
                            <ArrowUpRight className="absolute -bottom-6 -right-6 w-40 h-40 text-gray-50 group-hover:text-blue-50/80 transition-colors duration-300 -z-0 rotate-12" />
                        </div>
                    </Link>

                    {/* Aldığım Teklifler */}
                    <Link href="/profile/tekliflerim/seller" className="group">
                        <div className="h-full bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 relative overflow-hidden">
                            <div className="flex flex-col gap-5 relative z-10">
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-300 shadow-sm">
                                    <ArrowDownLeft className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Aldığım Teklifler</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Satıştaki ürünleriniz için gelen teklifleri inceleyin, kabul edin veya yeni teklif sunun.
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Icon */}
                            <ArrowDownLeft className="absolute -bottom-6 -right-6 w-40 h-40 text-gray-50 group-hover:text-purple-50/80 transition-colors duration-300 -z-0 -rotate-12" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}