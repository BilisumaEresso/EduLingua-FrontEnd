import {
  AlertCircle,
  Bot,
  Crown,
  Loader2,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getMyChat, sendMessage as sendChatMessage } from "../services/chat";
import useAuthStore from "../store/authStore";

const FREE_LIMIT = 30;

const TypewriterMessage = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i+=2; // type speed optimization
      if (i > text.length) {
        setDisplayedText(text); // snap exactly to end
        clearInterval(intervalId);
      }
    }, 15);
    return () => clearInterval(intervalId);
  }, [text]);

  return <>{displayedText}<span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-middle" /></>;
};

const ChatPage = () => {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuthStore();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatCount, setChatCount] = useState(user?.chatCount ?? 0);
  const [sessionLoading, setSessionLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const isPremium = user?.isPremium;
  const isQuotaExhausted = !isPremium && chatCount >= FREE_LIMIT;

  // Load or create session on mount, seeding history from backend
  useEffect(() => {
    getMyChat()
      .then((res) => {
        const chatSession =
          res?.data?.session || res?.data || res?.chat || null;
        setSession(chatSession);
        const history = chatSession?.messages || [];
        if (history.length > 0) {
          const mapped = history.map((m, idx) => ({
            id: 1000 + idx,
            sender: m.sender === "user" ? "user" : "ai",
            text: m.content || m.text,
          }));
          setMessages(mapped);
        } else {
          // Default localized welcome for new sessions
          const firstName = user?.fullName?.split(" ")[0] || t('general.student');
          setMessages([
            {
              id: "welcome",
              sender: "ai",
              text: t('chat.welcome', { name: firstName }),
            },
          ]);
        }
      })
      .catch(() => {
        /* session load failure is non-critical — chat still works */
      })
      .finally(() => setSessionLoading(false));
  }, [t, user?.fullName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      const text = inputValue.trim();
      if (!text || isTyping || isQuotaExhausted) return;

      const userMsg = { id: Date.now(), sender: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      try {
        // Call /chat/send via chat service
        const res = await sendChatMessage({
          message: text,
          ...(session?._id ? { sessionId: session._id } : {}),
        });
        const aiText =
          res?.data?.reply ||
          res?.data?.message ||
          res?.data?.text ||
          t('chat.rephrase');

        const aiMsg = { id: Date.now() + 1, sender: "ai", text: aiText, isAnimated: true };
        setMessages((prev) => [...prev, aiMsg]);

        // Sync with absolute truth directly from server response
        if (res?.data?.chatCount !== undefined) {
          setChatCount(res.data.chatCount);
        }
        await checkAuth(); // Sync user store state seamlessly
      } catch (err) {
        const status = err?.response?.status;
        if (status === 429 || status === 403) {
          setChatCount(FREE_LIMIT);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: "ai",
              text: t('chat.error'),
            },
          ]);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [inputValue, isTyping, isQuotaExhausted, session?._id, checkAuth, t],
  );

  // Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5 relative z-0">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="p-5 sm:px-8 sm:py-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-white/20 dark:border-slate-800/50 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 text-white rounded-[1.2rem] flex items-center justify-center transform hover:rotate-3 hover:scale-105 transition-all duration-300">
              <Bot className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 flex items-center gap-2 tracking-tight">
              {t('chat.title')} <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t('chat.subtitle')}
            </p>
          </div>
        </div>

        {/* Quota badge */}
        {!isPremium && (
          <div className="flex items-center gap-3">
            <div
              className={`text-xs font-bold px-4 py-2 rounded-full shadow-sm border ${
                isQuotaExhausted
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {chatCount} / {FREE_LIMIT} <span className="hidden sm:inline">{t('nav.aiTutorChat').split(' ')[2] || 'chats'}</span>
            </div>
            {isQuotaExhausted && (
              <Link
                to="/premium"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-yellow-950 px-4 py-2 rounded-full transition-all shadow-md shadow-amber-500/20 hover:scale-105"
              >
                <Crown className="w-4 h-4" /> {t('chat.upgrade')}
              </Link>
            )}
          </div>
        )}
        {isPremium && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-900/50 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-700 dark:text-yellow-400 shadow-sm">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-bold">{t('chat.premiumLimitless')}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth will-change-scroll">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <Motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-4 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                  msg.sender === "user"
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/30"
                }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`px-6 py-4 rounded-[1.5rem] leading-relaxed whitespace-pre-wrap text-[15px] font-medium ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white rounded-tr-[4px] shadow-lg shadow-fuchsia-600/20"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-[4px] shadow-xl shadow-slate-200/40 dark:shadow-none"
                }`}
              >
                {msg.isAnimated ? (
                  <TypewriterMessage text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </Motion.div>
          ))}

          {isTyping && (
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%] mr-auto"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-6 py-5 rounded-3xl rounded-tl-[4px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-2 h-[52px]">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Quota exhausted banner */}
      {isQuotaExhausted && (
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-between gap-4 border-t border-amber-200 dark:border-amber-800/50 z-10 w-full mb-0">
          <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">
              {t('chat.limitReached')}
            </p>
          </div>
          <Link
            to="/premium"
            className="shrink-0 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:scale-105"
          >
            <Crown className="w-4 h-4" /> {t('chat.upgrade')}
          </Link>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:px-6 sm:py-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-t border-white/20 dark:border-slate-800/50 z-10 relative">
        <form onSubmit={sendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isQuotaExhausted}
              placeholder={
                isQuotaExhausted
                  ? t('chat.limitPlaceholder')
                  : t('chat.placeholder')
              }
              rows={1}
              className="w-full min-h-[60px] max-h-32 bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 rounded-3xl py-4 px-6 text-slate-900 dark:text-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400 text-[15px] font-medium leading-relaxed shadow-inner"
              style={{ fieldSizing: "content" }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping || isQuotaExhausted}
            className="shrink-0 w-[60px] h-[60px] rounded-[1.2rem] bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105"
          >
            {isTyping ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-6 h-6 ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
