"use client"
import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react"
import Image from "next/image"

interface Message {
    id: number
    role: "user" | "assistant"
    text: string
    time: string
}

function getTime() {
    return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: "assistant",
            text: "Merhaba! Ben 2pazar yapay zeka asistanıyım. Size nasıl yardımcı olabilirim? 🛍️",
            time: getTime(),
        },
    ])
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, open])

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300)
    }, [open])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        const userMsg: Message = { id: Date.now(), role: "user", text, time: getTime() }
        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setLoading(true)


        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    text: "Gemini entegrasyonu yakında aktif olacak. Şu an test modundayım! 🚀",
                    time: getTime(),
                },
            ])
            setLoading(false)
        }, 1000)
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <>
            {/* Chat penceresi */}
            <div
                style={{
                    position: "fixed",
                    bottom: open ? "90px" : "90px",
                    right: "24px",
                    width: "360px",
                    maxHeight: "520px",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,96,0,0.08)",
                    transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "all" : "none",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transformOrigin: "bottom right",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid rgba(255,255,255,0.15)",
                            }}
                        >
                            <Sparkles size={20} color="#a78bfa" />
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "-2px",
                                right: "-2px",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "#22c55e",
                                border: "2px solid #16213e",
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}>
                            AI Asistan
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                            Powered by Gemini
                        </p>
                    </div>
                    {/* Gemini küçük badge */}

                </div>

                {/* Mesaj alanı */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "16px",
                        background: "#fafafa",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxHeight: "340px",
                    }}
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: "flex",
                                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                                alignItems: "flex-end",
                                gap: "8px",
                            }}
                        >
                            {msg.role === "assistant" && (
                                <div
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "8px",
                                        background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Bot size={14} color="white" />
                                </div>
                            )}
                            <div style={{ maxWidth: "75%" }}>
                                <div
                                    style={{
                                        padding: "10px 13px",
                                        borderRadius: msg.role === "user"
                                            ? "16px 16px 4px 16px"
                                            : "16px 16px 16px 4px",
                                        background: msg.role === "user"
                                            ? "linear-gradient(135deg, #ff6000, #e55500)"
                                            : "white",
                                        color: msg.role === "user" ? "white" : "#1f2937",
                                        fontSize: "13px",
                                        lineHeight: "1.5",
                                        boxShadow: msg.role === "user"
                                            ? "0 2px 8px rgba(255,96,0,0.3)"
                                            : "0 2px 8px rgba(0,0,0,0.06)",
                                        border: msg.role === "assistant" ? "1px solid #f3f4f6" : "none",
                                    }}
                                >
                                    {msg.text}
                                </div>
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: "#9ca3af",
                                        marginTop: "3px",
                                        textAlign: msg.role === "user" ? "right" : "left",
                                    }}
                                >
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Yazıyor animasyonu */}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                            <div
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Bot size={14} color="white" />
                            </div>
                            <div
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: "16px 16px 16px 4px",
                                    background: "white",
                                    border: "1px solid #f3f4f6",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    gap: "4px",
                                    alignItems: "center",
                                }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        style={{
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: "#9ca3af",
                                            display: "inline-block",
                                            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input alanı */}
                <div
                    style={{
                        padding: "12px 14px",
                        background: "white",
                        borderTop: "1px solid #f3f4f6",
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Mesajınızı yazın..."
                        disabled={loading}
                        style={{
                            flex: 1,
                            border: "1.5px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "9px 13px",
                            fontSize: "13px",
                            outline: "none",
                            background: "#f9fafb",
                            color: "#111827",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#ff6000")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "11px",
                            background: input.trim() && !loading
                                ? "linear-gradient(135deg, #ff6000, #e55500)"
                                : "#e5e7eb",
                            border: "none",
                            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            flexShrink: 0,
                            boxShadow: input.trim() && !loading ? "0 3px 10px rgba(255,96,0,0.35)" : "none",
                        }}
                    >
                        <Send size={15} color={input.trim() && !loading ? "white" : "#9ca3af"} />
                    </button>
                </div>
            </div>

            {/* FAB Butonu */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="AI Chat Asistanı"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: open
                        ? "linear-gradient(135deg, #374151, #1f2937)"
                        : "linear-gradient(135deg, #ff6000, #e55500)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
                    boxShadow: open
                        ? "0 4px 20px rgba(0,0,0,0.3)"
                        : "0 4px 20px rgba(255,96,0,0.5)",
                    transform: "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
            >
                <div
                    style={{
                        transform: open ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {open ? (
                        <X size={22} color="white" />
                    ) : (
                        <MessageCircle size={22} color="white" />
                    )}
                </div>

                {/* Ping animasyonu (kapalıyken) */}
                {!open && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "#22c55e",
                            border: "2px solid white",
                            animation: "ping 2s ease-in-out infinite",
                        }}
                    />
                )}
            </button>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    70% { transform: scale(1.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </>
    )
}
