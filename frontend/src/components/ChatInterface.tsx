import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { PaperAirplaneIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, SpeakerWaveIcon, PauseIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import SplineScene from './SplineScene';


type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  emotion?: string;
  confidence?: number;
  risk?: string;
  suggestions?: string[];
  status?: 'sent' | 'delivered' | 'read';
};

// ─── Emotion badge color map ────────────────────────────────────────────────
const emotionColors: Record<string, string> = {
  sad: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  happy: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  anxious: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  angry: 'bg-red-500/20 text-red-300 border-red-500/30',
  neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  fear: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  default: 'bg-primary/20 text-primary-light border-primary/30',
};

const getEmotionColor = (emotion: string) =>
  emotionColors[emotion?.toLowerCase()] ?? emotionColors.default;

// ─── Emotion emoji map ───────────────────────────────────────────────────────
const emotionEmoji: Record<string, string> = {
  sad: '😢', happy: '😊', anxious: '😰', angry: '😠',
  neutral: '😐', fear: '😨', default: '💙',
};
const getEmotionEmoji = (e: string) =>
  emotionEmoji[e?.toLowerCase()] ?? emotionEmoji.default;

// ─── ChatBubble Component ────────────────────────────────────────────────────
function ChatBubble({ msg, onNavigate }: { msg: Message; onNavigate: (tab: string) => void }) {
  const isUser = msg.sender === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') || voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB') || voices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div className={`flex items-end gap-2 md:gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg
          ${isUser
            ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white'
            : 'bg-gradient-to-br from-teal-500/30 to-primary/30 border border-primary/30 text-primary-light backdrop-blur-md'}`}>
          {isUser ? 'U' : <SparklesIcon className="w-4 h-4" />}
        </div>

        <div className={`relative px-4 md:px-5 py-3 md:py-3.5 rounded-2xl shadow-lg
          ${isUser
            ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm shadow-violet-500/20'
            : 'glass-panel text-text-main rounded-bl-sm'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

          {!isUser && (
            <button 
              onClick={() => toggleSpeech(msg.text)}
              className={`absolute -right-8 md:-right-10 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300
                ${isSpeaking 
                  ? 'bg-primary/20 text-primary-light shadow-[0_0_15px_rgba(102,252,241,0.3)] scale-110' 
                  : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-primary-light'}`}
              title="Listen to response"
            >
              {isSpeaking ? <PauseIcon className="w-3 md:w-4 h-3 md:h-4" /> : <SpeakerWaveIcon className="w-3 md:w-4 h-3 md:h-4" />}
            </button>
          )}

          {isUser && (
            <div className="flex justify-end -mb-1 mt-1">
              <div className="flex items-center -space-x-1 opacity-80 scale-75 md:scale-90 origin-right">
                <span className={`text-[10px] md:text-[11px] font-bold ${msg.status === 'read' ? 'text-blue-300' : 'text-white/40'}`}>✓</span>
                {(msg.status === 'delivered' || msg.status === 'read') && (
                  <span className={`text-[10px] md:text-[11px] font-bold ${msg.status === 'read' ? 'text-blue-300' : 'text-white/40'}`}>✓</span>
                )}
              </div>
            </div>
          )}

          {!isUser && msg.emotion && msg.emotion !== 'unknown' && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[9px] md:text-[10px] uppercase tracking-widest px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border font-semibold ${getEmotionColor(msg.emotion)}`}>
                <span>{getEmotionEmoji(msg.emotion)}</span>
                {msg.emotion}
                {(msg as any).confidence && (
                  <span className="opacity-70">· {Math.round((msg as any).confidence * 100)}%</span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
        <SuggestionChips suggestions={msg.suggestions} onNavigate={onNavigate} />
      )}
    </motion.div>
  );
}

// ─── SuggestionChips Component ───────────────────────────────────────────────
function SuggestionChips({ suggestions, onNavigate }: { suggestions: string[]; onNavigate: (tab: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap gap-2 ml-9 md:ml-11"
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => {
            if (s.toLowerCase().includes('breathe') || s.toLowerCase().includes('calm')) onNavigate('hub');
            else if (s.toLowerCase().includes('visual')) onNavigate('visuals');
            else if (s.toLowerCase().includes('game')) onNavigate('games');
          }}
          className="text-[10px] md:text-[11px] font-medium bg-white/5 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-blue-500/20 border border-white/10 hover:border-violet-500/40 px-3 md:px-4 py-1 md:py-1.5 rounded-full transition-all duration-200 text-gray-300 hover:text-white backdrop-blur-sm"
        >
          {s}
        </button>
      ))}
    </motion.div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 md:gap-3"
    >
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-teal-500/30 to-primary/30 border border-primary/30 flex items-center justify-center flex-shrink-0">
        <SparklesIcon className="w-4 h-4 text-primary-light" />
      </div>
      <div className="glass-panel px-4 md:px-5 py-2.5 md:py-3 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-lg">
        <span className="text-[11px] md:text-xs text-text-muted font-medium">Sahaay is typing</span>
        <div className="flex gap-1 mt-0.5">
          {[0, 0.2, 0.4].map((delay, i) => (
            <span
              key={i}
              className="w-1 h-1 bg-primary-light rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ChatInput Component ─────────────────────────────────────────────────────
function ChatInput({
  input, setInput, handleSend, isListening, startListening, isTyping
}: {
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
  isListening: boolean;
  startListening: () => void;
  isTyping: boolean;
}) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend();
    }
  };

  return (
    <div className="p-3 md:p-6 bg-black/20 backdrop-blur-sm border-t border-white/5">
      <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-4">
        <div className="flex-1 relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Tell Sahaay..."}
            disabled={isTyping}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3.5 md:py-4 outline-none focus:border-violet-500/50 transition-all text-sm md:text-base text-text-main placeholder:text-text-muted pr-12 md:pr-14"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 md:right-3 p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl text-white disabled:opacity-30 shadow-lg"
          >
            <PaperAirplaneIcon className="w-4 md:w-5 h-4 md:h-5" />
          </button>
        </div>
        <button
          onClick={startListening}
          className={`p-3.5 md:p-4 rounded-2xl transition-all shadow-xl flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'}`}
        >
          <MicrophoneIcon className="w-5 md:w-6 h-5 md:h-6" />
        </button>
      </div>
    </div>
  );
}

// ─── Main ChatInterface ──────────────────────────────────────────────────────
const enableBorderGlow = true;

const translations: Record<string, Record<string, string>> = {
  'English': {
    chat_title: "Hey, I am Sahaay!",
    chat_subtitle: "How can I help you today?"
  },
  'हिंदी': {
    chat_title: "हाय, मैं सहाय हूँ!",
    chat_subtitle: "मैं आज आपकी कैसे मदद कर सकता हूँ?"
  },
  'ಕನ್ನಡ': {
    chat_title: "ಹಾಯ್, ನಾನು ಸಹಾಯ!",
    chat_subtitle: "ನಾನು ನಿಮಗೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
  }
};

export default function ChatInterface({ language, onNavigate }: { language: string; onNavigate: (tab: string) => void }) {
  const t = translations[language] || translations['English'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [highRiskAlert, setHighRiskAlert] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'हिंदी' ? 'hi-IN' : language === 'ಕನ್ನಡ' ? 'kn-IN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user', status: 'sent' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setHighRiskAlert(false);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' as const } : m));
    }, 600);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
        message: userMsg.text,
        language,
        userId: user?.id || 'guest',
      });

      setTimeout(() => {
        const botMsg: Message = {
          id: Date.now(),
          text: data.reply,
          sender: 'bot',
          emotion: data.emotion,
          risk: data.risk,
          suggestions: data.suggestions,
        };
        setMessages(prev => [
          ...prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' as const } : m),
          botMsg
        ]);
        if (data.risk === 'HIGH') setHighRiskAlert(true);
        setIsTyping(false);
      }, 1000);
    } catch (e: any) {
      setIsTyping(false);
      const errorMsg: Message = {
        id: Date.now(),
        text: "I'm having a bit of trouble connecting to my brain right now. Please check your connection! 💙",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative ${enableBorderGlow ? 'chatbox-border' : ''}`} style={{ background: 'var(--app-bg-fixed)' }}>
      <div className="absolute inset-0 -z-10" style={{ background: 'var(--app-bg-fixed)' }} />
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 md:w-80 h-48 md:h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-white/5 bg-black/10 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-text-main leading-tight">Sahaay</h3>
              <p className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-widest">Silent Support AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] md:text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Sahaay is here</span>
            <span className="sm:hidden">Online</span>
          </div>
        </div>

        <AnimatePresence>
          {highRiskAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-dark-900/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-red-900/90 to-red-950/90 border border-red-500/40 p-6 md:p-8 rounded-3xl text-center shadow-2xl max-w-sm w-full backdrop-blur-xl"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl md:text-2xl">💙</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-white">We're here for you</h3>
                <p className="text-xs md:text-sm mb-6 text-gray-300 leading-relaxed">
                  It sounds like you're going through a lot. Please consider talking to a professional who can help right now.
                </p>
                <div className="flex flex-col gap-3">
                  <a href="tel:988" className="bg-white text-red-900 text-sm md:text-base font-bold py-3 rounded-2xl hover:bg-gray-100 transition shadow-lg block">
                    📞 Call Crisis Helpline (988)
                  </a>
                  <button onClick={() => setHighRiskAlert(false)} className="text-[10px] md:text-xs text-gray-500 hover:text-gray-300 transition py-2">
                    Continue conversation
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-8 scrollbar-hide relative">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="spline-blob"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-10"
                >
                  <div className="w-full max-w-[200px] sm:max-w-sm aspect-square relative mb-4">
                    <SplineScene
                      scene="https://my.spline.design/aiblob-92RJJUBGDsHBl4kOfSrvpYWc/"
                      className="w-full h-full rounded-full pointer-events-none overflow-hidden"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[120px] z-20 pointer-events-none" style={{ background: 'var(--app-bg-fixed)' }} />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-[-20px] md:mt-[-48px] relative z-30"
                  >
                    <h2 className="text-xl md:text-3xl font-bold text-text-main leading-tight">{t.chat_title}</h2>
                    <p className="text-xs md:text-sm opacity-70 mt-2">{t.chat_subtitle}</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat-messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {messages.map(msg => (
                    <ChatBubble key={msg.id} msg={msg} onNavigate={onNavigate} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-white/5 flex-shrink-0" style={{ background: 'var(--app-bg-fixed)' }}>
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              isListening={isListening}
              startListening={startListening}
              isTyping={isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

