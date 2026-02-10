import { offer_status_map } from "./const";
import { Clock } from "lucide-react";
import { getRemainingTime } from "./format";
export default function getOfferStatus(status: number, expiresAt?: string | Date | null) {
    const base =
        offer_status_map[status] ?? {
            label: "Bilinmiyor",
            color: "bg-gray-50 text-gray-500 border-gray-200",
            icon: <Clock size={14} />,
        };
    // Bekliyor + son geçerlilik tarihi varsa → sayaç
    if (status === 0 && expiresAt) {
        return {
            ...base,
            label: ` ${getRemainingTime(expiresAt)}`,
        };
    }
    return base
}