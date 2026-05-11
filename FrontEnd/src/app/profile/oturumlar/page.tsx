"use client"
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { useToast } from "@/context/toastContext";
import { useSessions } from "@/lib/api/user/useSessions";
import { useDropSession } from "@/lib/api/user/useDropSession";
import { Session } from "@/lib/types/types";
import {
    Monitor,
    Smartphone,
    Globe,
    Clock,
    MapPin,
    Shield,
    RefreshCw,
    Trash2,
    Laptop,
    Tablet,
} from "lucide-react";



function parseUserAgent(ua: string) {
    let device = "Bilinmeyen Cihaz";

    let browser = "Bilinmeyen Tarayıcı";
    let os = "Bilinmeyen İşletim Sistemi";
    let icon: React.ElementType = Monitor;

    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

    if (/edg\//i.test(ua)) browser = "Edge";
    else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
    else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
    else if (/firefox/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

    if (/mobile/i.test(ua) || (/android/i.test(ua) && !/tablet/i.test(ua))) {
        device = "Mobil";
        icon = Smartphone;
    } else if (/tablet|ipad/i.test(ua)) {
        device = "Tablet";
        icon = Tablet;
    } else {
        device = "Bilgisayar";
        icon = /macintosh|mac os/i.test(ua) ? Laptop : Monitor;
    }

    return { device, browser, os, icon };
}

function parseUTCDate(dateStr: any) {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    
    let val = dateStr;
    if (typeof val === 'object') {
        if (val.Time) val = val.Time;
        else val = String(val);
    }
    
    let isoStr = String(val);
    if (isoStr === '[object Object]') return new Date(NaN);
    
    if (!isoStr.includes('T')) {
        isoStr = isoStr.replace(' ', 'T');
    }
    
    isoStr = isoStr.replace(/\.(\d{1,3})\d+/, '.$1');
    
    isoStr = isoStr.replace(/([\+\-]\d{2})$/, '$1:00');

    if (!isoStr.endsWith('Z') && !isoStr.match(/[\+\-]\d{2}:\d{2}$/) && !isoStr.includes('Z')) {
        isoStr += 'Z';
    }
    
    return new Date(isoStr);
}

function formatDate(dateStr: string) {
    try {
        const date = parseUTCDate(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return String(dateStr);
    }
}

function timeAgo(dateStr: string) {
    try {
        const date = parseUTCDate(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return "Az önce";
        if (diffMin < 60) return `${diffMin} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 30) return `${diffDays} gün önce`;
        return formatDate(dateStr);
    } catch {
        return String(dateStr);
    }
}

function isSessionExpired(expiresAt: string) {
    try {
        return parseUTCDate(expiresAt).getTime() < Date.now();
    } catch {
        return false;
    }
}



export default function SessionsPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { showNotification } = useToast();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [droppingId, setDroppingId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const handleDrop = async (id: string) => {
        setDroppingId(id);
        try {
            await useDropSession(id);
            setSessions((prev) => prev.filter((s) => s.ID !== id));
            showNotification("Oturum sonlandırıldı", "success", 3000);
        } catch (err) {
            if (err instanceof Error) {
                showNotification(err.message, "error", 4000);
            } else {
                showNotification("Oturum sonlandırılırken hata oluştu", "error", 4000);
            }
        } finally {
            setDroppingId(null);
            setConfirmId(null);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await useSessions();
            setSessions(data.data.Sessions || []);
        } catch (err) {
            if (err instanceof Error) {
                showNotification(err.message, "error", 4000);
            } else {
                showNotification("Oturumlar yüklenirken bir hata oluştu", "error", 4000);
            }
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        if (user) fetchSessions();
    }, [user, fetchSessions]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#ff6000] mb-3" />
                    <p className="text-sm text-gray-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    const sortedSessions = [...sessions].sort((a, b) => {
        const aExpired = isSessionExpired(a.ExpiresAt);
        const bExpired = isSessionExpired(b.ExpiresAt);
        if (aExpired !== bExpired) return aExpired ? 1 : -1;
        return parseUTCDate(b.LastActivityAt).getTime() - parseUTCDate(a.LastActivityAt).getTime();
    });

    const activeSessions = sortedSessions.filter((s) => !isSessionExpired(s.ExpiresAt));
    const expiredSessions = sortedSessions.filter((s) => isSessionExpired(s.ExpiresAt));

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#fff4ed] rounded-lg flex items-center justify-center">
                            <Shield className="text-[#ff6000] w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Oturumlar</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Hesabınıza bağlı tüm aktif oturumları görüntüleyin.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchSessions}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        Yenile
                    </button>
                </div>



                {activeSessions.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                Aktif Oturumlar ({activeSessions.length})
                            </h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {activeSessions.map((session, index) => (
                                <SessionCard
                                    key={session.ID}
                                    session={session}
                                    index={index}
                                    isExpired={false}
                                    isDropping={droppingId === session.ID}
                                    showConfirm={confirmId === session.ID}
                                    onConfirmToggle={() => setConfirmId(prev => prev === session.ID ? null : session.ID)}
                                    onDrop={() => handleDrop(session.ID)}
                                    onCancel={() => setConfirmId(null)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {expiredSessions.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Süresi Dolmuş Oturumlar ({expiredSessions.length})
                            </h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            {expiredSessions.map((session, index) => (
                                <SessionCard
                                    key={session.ID}
                                    session={session}
                                    index={index}
                                    isExpired={true}
                                    isDropping={droppingId === session.ID}
                                    showConfirm={confirmId === session.ID}
                                    onConfirmToggle={() => setConfirmId(prev => prev === session.ID ? null : session.ID)}
                                    onDrop={() => handleDrop(session.ID)}
                                    onCancel={() => setConfirmId(null)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {sessions.length === 0 && !loading && (
                    <div className="text-center border border-gray-200 rounded-lg p-12 bg-white">
                        <Shield size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-sm text-gray-500">Henüz aktif oturum bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
}



interface SessionCardProps {
    session: Session;
    index: number;
    isExpired: boolean;
    isDropping: boolean;
    showConfirm: boolean;
    onConfirmToggle: () => void;
    onDrop: () => void;
    onCancel: () => void;
}

function SessionCard({ session, index, isExpired, isDropping, showConfirm, onConfirmToggle, onDrop, onCancel }: SessionCardProps) {
    const { device, browser, os, icon: DeviceIcon } = parseUserAgent(session.UserAgent);

    return (
        <div
            className={`bg-white border rounded-lg transition-all duration-300 hover:shadow-md ${isExpired
                ? "border-gray-200 opacity-60"
                : "border-gray-200 hover:border-gray-300"
                }`}
            style={{
                animationDelay: `${index * 60}ms`,
                animation: "fadeInUp 0.4s ease-out forwards",
                opacity: 0,
            }}
        >
            <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpired ? "bg-gray-100" : "bg-[#fff4ed]"
                                }`}
                        >
                            <DeviceIcon
                                size={20}
                                className={isExpired ? "text-gray-400" : "text-[#ff6000]"}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {browser} · {os}
                                </h3>
                                {!isExpired ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                                        Süresi Dolmuş
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mt-1">{device}</p>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-3">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <MapPin size={12} className="text-gray-400" />
                                    <span>{session.IpAddress}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Clock size={12} className="text-gray-400" />
                                    <span>Son aktivite: {timeAgo(session.LastActivityAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Globe size={12} className="text-gray-400" />
                                    <span>Başlangıç: {formatDate(session.StartedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {!showConfirm ? (
                            <button
                                onClick={onConfirmToggle}
                                disabled={isDropping}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                                Sonlandır
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onDrop}
                                    disabled={isDropping}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                                >
                                    {isDropping ? (
                                        <>
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                            Siliniyor
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={13} />
                                            Eminim
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                    İptal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                className={`h-0.5 rounded-b-lg ${isExpired
                    ? "bg-gray-200"
                    : "bg-gradient-to-r from-[#ff6000] via-[#ff8533] to-[#fff4ed]"
                    }`}
            />
        </div>
    );
}
