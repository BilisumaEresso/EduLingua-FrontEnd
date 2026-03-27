import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import userProgressService from '../services/userProgress';
import { getMyChat, sendMessage as sendChatMessage } from '../services/chat';

const FREE_LIMIT = 5;

const ChatPage = () => {
  const { user, checkAuth } = useAuthStore();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatCount, setChatCount] = useState(user?.chatCount ?? 0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isPremium = user?.isPremium;
  const isQuotaExhausted = !isPremium && chatCount >= FREE_LIMIT;

  // Load or create session on mount, seeding history from backend
  useEffect(() => {
    getMyChat()
      .then(res => {
        console.log(res)
        const chatSession = res?.data?.data.session || res?.data || res?.chat || null;
        setSession(chatSession);
        // If backend returns previous messages, seed them after the welcome
        const history = chatSession?.messages || [];
        if (history.length > 0) {
          const mapped = history.map((m, idx) => ({
            id: 1000 + idx,
            sender: m.role === 'user' ? 'user' : 'ai',
            text: m.content || m.text,
          }));
          setMessages(prev => [...prev, ...mapped]);
        }
      })
      .catch(() => { /* session load failure is non-critical — chat still works */ })
      .finally(() => setSessionLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isTyping || isQuotaExhausted) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call /chat/send via chat service
      const res = await sendChatMessage({
        message: text,
        ...(session?._id ? { sessionId: session._id } : {}),
      });
      const aiText = res?.data?.reply || res?.data?.message || res?.data?.text || "I didn't understand that. Can you rephrase?";

      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiText };
      setMessages(prev => [...prev, aiMsg]);

      // Increment AI chat count in progress service
      try {
        await userProgressService.incrementAIChat({});
        setChatCount(prev => prev + 1);
        await checkAuth();
      } catch { /* non-critical */ }

    } catch (err) {
      const status = err?.response?.status;
      if (status === 429 || status === 403) {
        setChatCount(FREE_LIMIT);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I\'m having trouble connecting. Please try again in a moment.'
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, isQuotaExhausted, chatCount, checkAuth]);

  // Enter key support
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Tutor <Sparkles className="w-4 h-4 text-fuchsia-500" />
            </h2>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Online · Language Specialist</p>
          </div>
        </div>

        {/* Quota badge */}
        {!isPremium && (
          <div className="flex items-center gap-2">
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              isQuotaExhausted
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {chatCount}/{FREE_LIMIT} chats
            </div>
            {isQuotaExhausted && (
              <Link
                to="/premium"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-3 py-1.5 rounded-full transition-colors"
              >
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </Link>
            )}
          </div>
        )}
        {isPremium && (
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
            ⭐ Premium — Unlimited
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.sender === 'user'
                ? 'bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-400'
                : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-3xl leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-fuchsia-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-5 py-4 rounded-3xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quota exhausted banner */}
      {isQuotaExhausted && (
        <div className="px-4 sm:px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">You've used all {FREE_LIMIT} free chats for today.</p>
          </div>
          <Link
            to="/premium"
            className="shrink-0 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            <Crown className="w-4 h-4" /> Go Premium
          </Link>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={sendMessage} className="relative flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isQuotaExhausted}
            placeholder={isQuotaExhausted ? 'Daily limit reached. Upgrade to continue.' : 'Type your message... (Enter to send)'}
            rows={1}
            className="flex-1 min-h-[48px] max-h-32 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 rounded-2xl py-3 px-5 text-slate-900 dark:text-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400"
            style={{ fieldSizing: 'content' }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping || isQuotaExhausted}
            className="shrink-0 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
