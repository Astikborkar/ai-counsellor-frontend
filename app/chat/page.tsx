'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Send, User, Bot, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import RouteGuard from "../components/RouteGuard";

type Message = {
    id: number;
    role: "user" | "bot";
    text: string;
};

export default function ChatPage() {
    const router = useRouter();
    const token = useAuthStore((s) => s.token);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: "bot", text: "Hello! I'm your AI study abroad counsellor. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [token]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now(), role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMsg.text,
                    profile: profile || {}, // Send profile context if available
                }),
            });

            const data = await res.json();

            if (res.ok) {
                const botMsg: Message = { id: Date.now() + 1, role: "bot", text: data.reply };
                setMessages((prev) => [...prev, botMsg]);

                // Handle visual feedback for actions
                if (data.actionTaken === "SHORTLIST") {
                    // Could show a toast here or just rely on the message
                    // Ideally, we might want to refresh some global context or notify user visually
                    // For now, the text response handles the confirmation well enough.
                } else if (data.actionTaken === "LOCK") {
                    // Confetti or major success indicator could go here
                }

            } else {
                throw new Error(data.message || "Failed to get response");
            }
        } catch (err) {
            console.error(err);
            const errorMsg: Message = { id: Date.now() + 1, role: "bot", text: "Sorry, I encountered an error. Please try again." };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RouteGuard>
            <main className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AI Counsellor</h1>
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "bot" && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot size={18} className="text-blue-600" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                                        }`}
                                >
                                    <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.text}</p>
                                </div>

                                {msg.role === "user" && (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User size={18} className="text-gray-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot size={18} className="text-blue-600" />
                                </div>
                                <div className="bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-blue-600" />
                                    <span className="text-sm text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
                    <div className="max-w-4xl mx-auto flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            placeholder="Ask anything about universities, applications, or scholarships..."
                            className="flex-grow px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 font-medium"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className={`px-4 py-3 rounded-xl flex items-center justify-center transition-all ${!input.trim() || isLoading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                                }`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        AI can make mistakes. Verify important information about deadlines and requirements.
                    </p>
                </div>
            </main>
        </RouteGuard>
    );
}
