import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, User, Bot, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

interface Message {
  role: "user" | "model";
  text: string;
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            { role: "user", parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: "You are the AetherScroll Sage, an omniscient guide who helps the player understand the world and their choices. You are helpful, mysterious, and encouraging. Never break character.",
        }
      });

      setMessages(prev => [...prev, { role: "model", text: response.text || "The void remains silent." }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-adventure-accent text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all z-50 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 backdrop-blur text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity rounded">
          Consult the Sage
        </span>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-adventure-bg/95 backdrop-blur-2xl border border-adventure-glass-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <header className="p-4 border-b border-adventure-glass-border flex items-center justify-between bg-adventure-glass">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-adventure-accent" />
                <h3 className="text-sm font-serif italic text-stone-200">The Sage's Presence</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bot className="w-8 h-8 text-adventure-glass-border mb-2" />
                  <p className="text-stone-500 text-xs italic font-serif">"Ask of the world, traveler. I see all that was and will be."</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "bg-adventure-accent text-white rounded-tr-none" 
                      : "bg-adventure-glass border border-adventure-glass-border text-stone-300 rounded-tl-none font-serif text-[13px]"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-adventure-glass border border-adventure-glass-border p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-adventure-accent" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <footer className="p-4 border-t border-adventure-glass-border bg-adventure-glass">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Whisper to the void..."
                  className="flex-1 bg-black/40 border border-adventure-glass-border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-adventure-accent transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-adventure-accent text-white rounded-full disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
