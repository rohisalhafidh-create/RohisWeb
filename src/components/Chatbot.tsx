import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MODELS = [
  { id: 'nvidia/nemotron-3.5-lightning:free', name: 'Nemotron Lightning', provider: 'openrouter' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google' },
  { id: 'liquid/lfm-2.5-2.6b:free', name: 'Liquid LFM 2.5', provider: 'openrouter' },
  { id: 'minimax/minimax-m3:free', name: 'Minimax M3', provider: 'openrouter' }
];

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya asisten virtual Rohis Al Hafidh. Ada yang bisa saya bantu?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let assistantReply = '';

      if (selectedModel.provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'RohisWeb',
          },
          body: JSON.stringify({
            model: selectedModel.id,
            messages: [
              { role: 'system', content: 'Anda adalah asisten virtual yang ramah untuk Rohis Al Hafidh SMKN 1 Semarang. Jawablah pertanyaan dengan sopan dan ringkas dalam bahasa Indonesia.' },
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMessage }
            ]
          })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          assistantReply = data.choices[0].message.content;
        } else {
          throw new Error('No valid response from OpenRouter');
        }
      } else if (selectedModel.provider === 'google') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel.id}:generateContent?key=${GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              ...messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
              })),
              {
                role: 'user',
                parts: [{ text: userMessage }]
              }
            ],
            systemInstruction: {
              parts: [{ text: 'Anda adalah asisten virtual yang ramah untuk Rohis Al Hafidh SMKN 1 Semarang. Jawablah pertanyaan dengan sopan dan ringkas dalam bahasa Indonesia.' }]
            }
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          assistantReply = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('No valid response from Google AI Studio');
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Coba model lain jika masalah berlanjut.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-green-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">RohisBot</h3>
                    <p className="text-[10px] text-green-100 opacity-90">Tanya apa saja seputar Rohis!</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Settings Dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-slate-50 border-b border-slate-200 overflow-hidden"
                  >
                    <div className="p-3">
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Pilih Model (Free)</label>
                      <select 
                        className="w-full text-xs p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        value={selectedModel.id}
                        onChange={(e) => {
                          const model = MODELS.find(m => m.id === e.target.value);
                          if (model) setSelectedModel(model);
                        }}
                      >
                        {MODELS.map(model => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1", msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-600")}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={cn("p-3 rounded-2xl text-sm whitespace-pre-wrap", msg.role === 'user' ? "bg-green-600 text-white rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 rounded-tl-sm flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-green-600" />
                      <span className="text-xs text-slate-500">Mengetik...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 bg-slate-100 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-105",
            isOpen ? "bg-slate-800 rotate-90" : "bg-green-600 hover:bg-green-700"
          )}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>
    </>
  );
}
