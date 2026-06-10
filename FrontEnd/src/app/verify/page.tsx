"use client";

import { useState } from "react"
import { Home, ShieldCheck, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Button from "@/features/components/button"
import SumsubKyc from "@/features/components/UI/Sumsub/sumsub"
import { useAuth } from "@/context/authContext";

export default function VerifyPage() {
    const [started, setStarted] = useState(false);
        const { user } = useAuth();


    return (
        <div className={`min-h-[calc(100vh-116px)] sm:min-h-[calc(100vh-10rem)] flex items-center justify-center transition-all duration-300 ${
            started ? 'p-0 sm:px-4 sm:py-12 bg-white sm:bg-[#fafafa]' : 'px-4 py-12'
        }`}>
            <div className={`w-full transition-all duration-500 ${started ? 'max-w-3xl' : 'max-w-lg'}`}>

                {/* Ana Kart */}
                <div
                    className={`relative bg-white overflow-hidden transition-all duration-300 ${
                        started 
                            ? 'w-full min-h-[calc(100vh-116px)] sm:min-h-0 sm:rounded-3xl border-0 sm:border sm:border-gray-100/80 sm:shadow-2xl sm:shadow-orange-500/5' 
                            : 'rounded-3xl border border-gray-100/80 shadow-2xl shadow-gray-200/50'
                    }`}
                >
                    {/* Üst dekoratif şerit */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />

                    {started ? (
                        <div className="p-4 sm:p-8">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-emerald-500 animate-pulse" size={24} />
                                    <h2 className="text-xl font-bold text-gray-900">Kimlik Doğrulama</h2>
                                </div>
                                <button
                                    onClick={() => setStarted(false)}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Vazgeç
                                </button>
                            </div>
                            <SumsubKyc />
                        </div>
                    ) : user?.verified === 1 ? (
                        <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                            {/* Glowing success icon */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-3xl blur-xl opacity-20 scale-125" />
                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                    <CheckCircle size={32} className="stroke-[1.5]" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Tamamlandı</h1>
                            <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                                Kimlik bilgileriniz başarıyla sisteme iletilmiştir.
                            </p>

                            {/* Moderasyon Durum Kartı */}
                            <div className="w-full rounded-2xl p-4 mb-8 bg-gray-50/80 border border-gray-100 text-left flex gap-3.5 items-start">
                                <div className="flex-shrink-0 rounded-xl p-2 bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <Clock size={18} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-gray-800">Moderatör İncelemesi</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Hesabınız moderatörlerimiz tarafından incelendikten sonra ilan vermeye başlayabilirsiniz. Satıcı rolünüz aktif edildiğinde e-posta ile bilgilendirileceksiniz.
                                    </p>
                                </div>
                            </div>

                            <Link href="/" className="w-full mb-6">
                                <Button
                                    variant="secondary"
                                    className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                                >
                                    <Home size={16} />
                                    Ana Sayfaya Dön
                                </Button>
                            </Link>

                            {/* Powered by Sumsub */}
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-50/60 border border-gray-100/80 w-fit mx-auto shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Powered by</span>
                                <Image
                                    src="/sumsub.jpeg"
                                    alt="Sumsub"
                                    width={16}
                                    height={16}
                                    className="rounded-sm"
                                />
                                <span className="text-xs font-bold text-gray-600">Sumsub</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 sm:p-10">
                            {/* Logo ve Başlık */}
                            <div className="flex flex-col items-center mb-8 text-center">
                                <div className="relative mb-5">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-3xl blur-xl opacity-25 scale-125" />
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                                        <ShieldCheck size={32} className="stroke-[1.5]" />
                                    </div>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                                    Kimlik Doğrulama
                                </h1>
                                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                                    İlan vermeniz için kimliğinizi doğrulamanız gerekmektedir.
                                </p>
                            </div>

                            {/* Adımlar */}
                            <div className="space-y-3 mb-8">
                                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-gray-50/70 transition-all duration-200 flex gap-3.5 items-start">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50/80 border border-orange-100/50 flex items-center justify-center text-[#ff6000] font-bold shrink-0 text-sm shadow-sm">
                                        1
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-gray-800">Kimlik Belgesi Yükleme</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Kimlik kartı, ehliyet veya pasaportunuzun net bir fotoğrafını yükleyin.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-gray-50/70 transition-all duration-200 flex gap-3.5 items-start">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50/80 border border-orange-100/50 flex items-center justify-center text-[#ff6000] font-bold shrink-0 text-sm shadow-sm">
                                        2
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-gray-800">Selfie (Canlılık Testi)</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Saniyeler süren hızlı bir yüz taraması gerçekleştirin.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Butonlar */}
                            <div className="space-y-3 mb-8">
                                <Button
                                    onClick={() => setStarted(true)}
                                    className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl bg-[#ff6000] hover:bg-[#e55500] hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200"
                                >
                                    <ShieldCheck size={16} />
                                    Doğrulamayı Başlat
                                </Button>

                                <Link href="/" className="w-full block">
                                    <Button
                                        variant="secondary"
                                        className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <Home size={16} />
                                        Ana Sayfaya Dön
                                    </Button>
                                </Link>
                            </div>

                            {/* Powered by Sumsub */}
                            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-50/60 border border-gray-100/80 w-fit mx-auto shadow-sm">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Powered by</span>
                                <Image
                                    src="/sumsub.jpeg"
                                    alt="Sumsub"
                                    width={16}
                                    height={16}
                                    className="rounded-sm"
                                />
                                <span className="text-xs font-bold text-gray-600">Sumsub</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}