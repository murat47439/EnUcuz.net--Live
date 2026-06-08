import { Home, ShieldCheck, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Button from "@/features/components/button"

export default function VerifyPage() {
    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

                {/* Ana Kart */}
                <div
                    className="relative bg-white rounded-2xl overflow-hidden"
                    style={{
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(255,96,0,0.12)",
                        border: "1px solid rgba(229,231,235,0.8)"
                    }}
                >
                    {/* Üst dekoratif şerit */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #ff6000 0%, #ff8c42 50%, #ffb347 100%)",
                            height: "5px",
                        }}
                    />

                    <div className="p-8 sm:p-10">
                        {/* Sumsub logo + badge */}
                        <div className="flex flex-col items-center mb-8">
                            {/* Sumsub logosu */}
                            <div
                                className="relative mb-6"
                                style={{
                                    background: "linear-gradient(135deg, #f0fdf9 0%, #e6fff8 100%)",
                                    borderRadius: "20px",
                                    padding: "20px",
                                    border: "1.5px solid rgba(52, 211, 153, 0.3)",
                                    boxShadow: "0 8px 24px rgba(52, 211, 153, 0.15)"
                                }}
                            >
                                {/* Animasyonlu halka */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: "-6px",
                                        borderRadius: "26px",
                                        border: "2px dashed rgba(52, 211, 153, 0.3)",
                                        animation: "spin 12s linear infinite",
                                    }}
                                />
                                <Image
                                    src="/sumsub.jpeg"
                                    alt="Sumsub"
                                    width={64}
                                    height={64}
                                    className="rounded-xl"
                                    style={{ display: "block" }}
                                />
                            </div>

                            {/* Başlık */}
                            <h1
                                className="text-2xl font-bold text-gray-900 mb-2 text-center"
                                style={{ letterSpacing: "-0.02em" }}
                            >
                                Kimlik Doğrulama
                            </h1>
                            <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed">
                                Hesabınızı güvende tutmak için kimlik doğrulama sürecimiz
                                yakında aktif olacak.
                            </p>
                        </div>

                        {/* Durum kartı */}
                        <div
                            className="rounded-xl p-4 mb-6 flex items-center gap-3"
                            style={{
                                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                                border: "1px solid rgba(255, 96, 0, 0.2)"
                            }}
                        >
                            <div
                                className="flex-shrink-0 rounded-full p-2"
                                style={{ background: "rgba(255,96,0,0.12)" }}
                            >
                                <Clock size={18} style={{ color: "#ff6000" }} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Çok Yakında</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Kimlik doğrulama modülü hazırlanıyor
                                </p>
                            </div>
                        </div>

                        {/* Özellik listesi */}
                        <div className="space-y-3 mb-8">
                            {[
                                { icon: ShieldCheck, text: "Yapay zeka destekli kimlik doğrulama", color: "#10b981" },
                                { icon: CheckCircle, text: "Saniyeler içinde güvenli onay", color: "#3b82f6" },
                                { icon: CheckCircle, text: "KVKK & GDPR uyumlu veri güvenliği", color: "#8b5cf6" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <item.icon size={16} style={{ color: item.color, flexShrink: 0 }} />
                                    <span className="text-sm text-gray-600">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Powered by Sumsub */}
                        <div
                            className="flex items-center justify-center gap-2 mb-6 py-2.5 rounded-lg"
                            style={{
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb"
                            }}
                        >
                            <span className="text-xs text-gray-400">Powered by</span>
                            <Image
                                src="/sumsub.jpeg"
                                alt="Sumsub"
                                width={18}
                                height={18}
                                className="rounded-sm"
                            />
                            <span className="text-xs font-semibold text-gray-600">Sumsub</span>
                        </div>

                        {/* Anasayfa Butonu */}
                        <Link href="/">
                            <Button
                                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-2.5 rounded-xl"
                                style={{
                                    background: "linear-gradient(135deg, #ff6000 0%, #e55500 100%)",
                                    boxShadow: "0 4px 15px rgba(255, 96, 0, 0.35)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Home size={16} />
                                Ana Sayfaya Dön
                            </Button>
                        </Link>
                    </div>
                </div>


            </div>

            {/* Spin animasyonu */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}