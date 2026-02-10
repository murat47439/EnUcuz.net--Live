import {
    CheckCircle2,
    XCircle,
    Ban,
    Timer,
    RefreshCw,
    HourglassIcon

} from "lucide-react";
/* ── Durum eşlemeleri ── */
export const offer_status_map: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    0: { label: "Bekliyor", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <HourglassIcon size={14} /> },
    1: { label: "Kabul Edildi", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
    2: { label: "Reddedildi", color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle size={14} /> },
    3: { label: "İptal Edildi", color: "bg-gray-50 text-gray-500 border-gray-200", icon: <Ban size={14} /> },
    4: { label: "Süresi Doldu", color: "bg-orange-50 text-orange-600 border-orange-200", icon: <Timer size={14} /> },
    5: { label: "Karşı Teklif", color: "bg-purple-50 text-purple-700 border-purple-200", icon: <RefreshCw size={14} /> },
};