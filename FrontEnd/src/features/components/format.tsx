export function formatPrice(price: number) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(price / 100);
}

export function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function getRemainingTime(expiresAt: string | Date) {
    const end = new Date(expiresAt).getTime()
    const now = Date.now()

    const diff = end - now;

    if (diff <= 0) {
        return "Süresi doldu"
    }
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    return `${hours % 24} saat ${minutes % 60} dakika`;
}