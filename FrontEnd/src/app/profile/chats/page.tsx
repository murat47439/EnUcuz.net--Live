"use client"
import { getChats } from "@/lib/api/chats/useGets";
import { getChat } from "@/lib/api/chats/useGet";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Chat, Chats, ChatMessage, ChatMessages, PaginationRequest } from "@/lib/types/types";
import { useToast } from "@/context/toastContext";
import { useAuth } from "@/context/authContext";
import { API_BASE_URL } from "@/lib/api/apiClient";
import {
    MessageSquare,
    Send,
    User,
    Package,
    Loader2,
    Wifi,
    WifiOff,
    ArrowLeft,
} from "lucide-react";
import PageLoader from "@/features/components/pageLoader";

interface WSIncoming {
    type: string;
    // private_message
    data?: {
        id?: number;
        chat_id?: number;
        content?: string;
        sender?: number;
        created_at?: { Time: string; Valid: boolean } | string;
    };
    // error
    text?: string;
    // success / leave
    room_id?: string;
    // user_status
    user_id?: number;
    status?: string;
    // new_chat (from controller notification)
    chat_id?: number;
    sender_id?: number;
    timestamp?: string;
}

export default function ChatPage() {
    const router = useRouter();
    const { showNotification } = useToast();
    const { user, isLoading: authLoading } = useAuth();

    const [chatList, setChatList] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [sending, setSending] = useState(false);

    // WebSocket
    const wsRef = useRef<WebSocket | null>(null);
    const [wsConnected, setWsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const selectedChatRef = useRef<Chat | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

    useEffect(() => {
        if (!authLoading && !user) router.push("/login");
    }, [user, authLoading, router]);

    /* ── Helper: Build WS event payload in backend format ── */
    const wsEvent = (type: string, data: Record<string, unknown>) => {
        return JSON.stringify({ type, data });
    };

    /* ── Fetch chats ── */
    const fetchChats = useCallback(async () => {
        if (authLoading || !user) return;
        try {
            setLoading(true);
            const req: PaginationRequest = { page: 1 };
            const data: Chats = await getChats(req);
            setChatList(data.data.chats || []);
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Bir hata oluştu", "error", 4000);
            setChatList([]);
        } finally {
            setLoading(false);
        }
    }, [authLoading, user, showNotification]);

    useEffect(() => { fetchChats(); }, [fetchChats]);

    // Mesaj container'ını en alta kaydır (sayfa değil, sadece mesaj alanı)
    const scrollToBottom = useCallback((smooth = true) => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: smooth ? "smooth" : "instant",
            });
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            requestAnimationFrame(() => scrollToBottom(true));
        }
    }, [messages, scrollToBottom]);

    /* ── WebSocket ── */
    const connectWebSocket = useCallback(() => {
        if (!user || !API_BASE_URL) return;
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }

        // API_BASE_URL = "https://domain/api" → WS = "wss://domain/api/ws/"
        const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws/";
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setWsConnected(true);
            // Eğer daha önce seçili chat varsa, odaya tekrar katıl
            if (selectedChatRef.current) {
                ws.send(wsEvent("join_room", { room_id: String(selectedChatRef.current.id) }));
            }
        };

        ws.onmessage = (event) => {
            try {
                const msg: WSIncoming = JSON.parse(event.data);

                switch (msg.type) {
                    case "private_message": {
                        // Backend: { "type": "private_message", "data": { id, chat_id, content, sender, created_at } }
                        const d = msg.data;
                        if (!d) break;
                        const chatId = d.chat_id;
                        if (selectedChatRef.current && chatId === selectedChatRef.current.id) {
                            const newMsg: ChatMessage = {
                                id: d.id || Date.now(),
                                chat_id: chatId || 0,
                                content: d.content || "",
                                sender: d.sender || 0,
                            };
                            setMessages((prev) => {
                                if (prev.some((m) => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                        }
                        break;
                    }
                    case "new_chat": {
                        // Controller'dan gelen bildirim: yeni sohbet oluşturuldu
                        showNotification("Yeni bir sohbet başlatıldı!", "info", 3000);
                        fetchChats();
                        break;
                    }
                    case "error": {
                        showNotification(msg.text || "WebSocket hatası", "error", 4000);
                        break;
                    }
                    case "success": {
                        // join_room veya leave_room başarılı olduğunda
                        console.log("WS room success:", msg.room_id);
                        break;
                    }
                    case "user_status": {
                        // Opsiyonel: kullanıcı online/offline durumu
                        console.log("User status:", msg.user_id, msg.status);
                        break;
                    }
                    default:
                        console.log("WS unknown event:", msg.type);
                }
            } catch (err) { console.error("WS parse error:", err); }
        };

        ws.onclose = () => {
            setWsConnected(false);
            reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
        };

        ws.onerror = (err) => console.error("WS error:", err);
        wsRef.current = ws;
    }, [user, fetchChats, showNotification]);

    useEffect(() => {
        if (!authLoading && user) connectWebSocket();
        return () => {
            wsRef.current?.close(); wsRef.current = null;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [authLoading, user, connectWebSocket]);

    /* ── Open chat ── */
    const openChat = async (chat: Chat) => {
        // Önceki odadan çık
        if (selectedChat && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(wsEvent("leave_room", { room_id: String(selectedChat.id) }));
        }
        setSelectedChat(chat);
        setMessages([]);
        setMessagesLoading(true);
        try {
            const data: ChatMessages = await getChat({ id: chat.id! });
            setMessages(data.data.messages || []);
        } catch (err) {
            if (err instanceof Error) showNotification(err.message, "error", 4000);
            else showNotification("Mesajlar yüklenemedi", "error", 4000);
            setMessages([]);
        } finally { setMessagesLoading(false); }
        // Yeni odaya katıl
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(wsEvent("join_room", { room_id: String(chat.id) }));
        }
    };

    /* ── Close chat (mobile back) ── */
    const closeChat = () => {
        if (selectedChat && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(wsEvent("leave_room", { room_id: String(selectedChat.id) }));
        }
        setSelectedChat(null);
        setMessages([]);
    };

    /* ── Send message ── */
    const handleSend = () => {
        if (!messageText.trim() || !selectedChat) return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            showNotification("Bağlantı yok, tekrar deneyin", "error", 3000);
            return;
        }
        setSending(true);
        try {
            // Backend expects: { "type": "private_message", "data": { "room_id": "123", "text": "..." } }
            wsRef.current.send(wsEvent("private_message", {
                room_id: String(selectedChat.id),
                text: messageText.trim(),
            }));
            setMessageText("");
        } catch { showNotification("Mesaj gönderilemedi", "error", 4000); }
        finally { setSending(false); }
    };

    /* ── Loading ── */
    if (loading || authLoading) {
        return <PageLoader label="Mesajlar yükleniyor" />;
    }

    /* ═══════════════════════════════════════
       ── RENDER ──
       ═══════════════════════════════════════ */
    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Page title */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">Mesajlarım</h1>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${wsConnected
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-red-50 text-red-500 border border-red-200"
                        }`}>
                        {wsConnected ? <Wifi size={9} /> : <WifiOff size={9} />}
                        {wsConnected ? "Çevrimiçi" : "Bağlantı yok"}
                    </span>
                </div>
            </div>

            {/* Split layout */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ height: "calc(100vh - 220px)", minHeight: "480px" }}>

                {/* ═══ SOL PANEL — Chat Listesi ═══ */}
                <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-gray-200 flex-shrink-0`}>
                    {/* Sol panel header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-700">Sohbetler</p>
                        <p className="text-xs text-gray-400 mt-0.5">{chatList.length} sohbet</p>
                    </div>

                    {/* Chat items */}
                    <div className="flex-1 overflow-y-auto">
                        {chatList.length > 0 ? (
                            chatList.map((chat) => {
                                const otherUserId = chat.sender === user?.id ? chat.recipient : chat.sender;
                                const isActive = selectedChat?.id === chat.id;
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => openChat(chat)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b border-gray-50 ${isActive
                                            ? "bg-[#fff4ed] border-l-2 border-l-[#ff6000]"
                                            : "hover:bg-gray-50 border-l-2 border-l-transparent"
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[#ff6000]" : "bg-gray-100"
                                            }`}>
                                            <User className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isActive ? "text-[#ff6000]" : "text-gray-900"}`}>
                                                Kullanıcı #{otherUserId}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Package size={10} /> Ürün #{chat.product_id}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                                <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                                <p className="text-sm text-gray-400 text-center">Henüz sohbet yok</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ SAĞ PANEL — Chat Detay veya Bilgilendirme ═══ */}
                <div className={`${selectedChat ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}>
                    {selectedChat ? (
                        <>
                            {/* Sohbet Header */}
                            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                {/* Mobile geri butonu */}
                                <button
                                    onClick={closeChat}
                                    className="md:hidden w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                                </button>

                                <div className="w-9 h-9 bg-[#ff6000] rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                        Kullanıcı #{selectedChat.sender === user?.id ? selectedChat.recipient : selectedChat.sender}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                                            <Package size={10} /> Ürün #{selectedChat.product_id}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Mesajlar */}
                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-6 h-6 text-[#ff6000] animate-spin" />
                                    </div>
                                ) : messages.length > 0 ? (
                                    <>
                                        {messages.map((msg) => {
                                            const isMe = msg.sender === user?.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                    {!isMe && (
                                                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                                            <User size={13} className="text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe
                                                        ? "bg-[#ff6000] text-white rounded-2xl rounded-br-md"
                                                        : "bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-100"
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            );
                                        })}



                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Henüz mesaj yok. İlk mesajı gönderin!</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="border-t border-gray-100 px-4 py-3 bg-white">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                                        }}
                                        placeholder="Mesajınızı yazın..."
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || !messageText.trim() || !wsConnected}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#ff6000] text-white hover:bg-[#e55500] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Bilgilendirme (hiç chat seçilmediğinde) ── */
                        <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                            <div className="text-center px-8 max-w-sm">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <MessageSquare className="w-9 h-9 text-gray-300" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    Sohbetlerinize Hoş Geldiniz
                                </h2>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    Soldaki listeden bir sohbet seçerek mesajlarınızı görüntüleyebilir ve karşı tarafla iletişime geçebilirsiniz.
                                </p>
                                <div className="space-y-2 text-left bg-white border border-gray-100 rounded-lg p-4">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-5 h-5 bg-[#fff4ed] rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[#ff6000] text-xs font-bold">1</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Teklifiniz kabul edildiğinde sohbet otomatik oluşturulur.</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}