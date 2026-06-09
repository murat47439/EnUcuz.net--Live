"use client";

import { useEffect, useState } from "react";
import { KycRequest } from "@/lib/api/user/useKyc";

declare global {
    interface Window {
        snsWebSdk: any;
    }
}

export default function SumsubKyc() {
    const [kyc, setKyc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1) KYC token al
    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await KycRequest();
            setKyc(res);
        } catch (err: any) {
            console.error("KYC init error:", err);
            setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // 2) SDK başlat
    useEffect(() => {
        if (!kyc?.token) return;
        if (!window.snsWebSdk) return;

        const sdk = window.snsWebSdk
            .init(kyc.token, async () => {
                const refreshed = await KycRequest();
                return refreshed.token;
            })
            .withConf({
                lang: "tr",
            })
            .withOptions({
                adaptIframeHeight: true,
            })
            .onMessage((type: string, payload: any) => {
                console.log("SUMSUB EVENT:", type, payload);
            })
            .build();

        sdk.launch("#sumsub-websdk");
    }, [kyc]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff6000]" />
                <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">Doğrulama oturumu hazırlanıyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="rounded-full bg-red-50 p-3 mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Bağlantı Hatası</h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">{error}</p>
                <button
                    onClick={load}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return <div id="sumsub-websdk" style={{ height: "700px" }} />;
}