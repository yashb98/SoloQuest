"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";

interface ChatMessage {
  role: "user" | "mentor";
  content: string;
  timestamp: Date;
}

export default function MentorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/mentor");
    const logs = await res.json();
    const history: ChatMessage[] = [];
    for (const log of logs.reverse()) {
      history.push({ role: "user", content: log.prompt, timestamp: new Date(log.createdAt) });
      history.push({ role: "mentor", content: log.response, timestamp: new Date(log.createdAt) });
    }
    setMessages(history);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "mentor", content: data.response, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "mentor",
        content: "The System encountered an error. Continue your quests, Hunter.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What quests should I focus on today?",
    "How can I improve my weakest stat?",
    "Give me a study plan for this week",
    "How am I doing overall?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em] mb-4">AI Mentor</h1>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="sq-panel p-6 text-center space-y-4">
            <Bot className="w-10 h-10 text-sq-accent mx-auto" />
            <p className="font-bold text-sq-text">The System is ready to guide you.</p>
            <p className="text-xs text-sq-muted">Ask for quest suggestions, study advice, stat analysis, or motivation.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="text-left p-2 rounded border border-sq-border hover:border-sq-gold/30 transition-all"
                >
                  <span className="text-xs text-sq-muted">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "mentor" && (
              <div className="w-7 h-7 rounded-md bg-sq-accent/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-sq-accent" />
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-sq-blue/20 border border-sq-blue/30"
                : "sq-panel border border-sq-accent/20"
            }`}>
              <p className="text-sm text-sq-text whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-md bg-sq-blue/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-sq-blue" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-md bg-sq-accent/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-sq-accent animate-pulse" />
            </div>
            <div className="sq-panel p-3 border border-sq-accent/20">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-sq-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-sq-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-sq-gold animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask the Mentor..."
          className="flex-1 bg-sq-bg border border-sq-border rounded-md px-4 py-2.5 text-sm text-sq-text focus:border-sq-gold/50 focus:outline-none transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="sq-button-gold px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
