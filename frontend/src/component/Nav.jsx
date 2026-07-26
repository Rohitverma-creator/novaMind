import { MessageSquare, RefreshCw, Trash2 } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";

const Nav = ({ onResetChat, isSyncing }) => {
  const selectedConversation = useSelector(
    (state) => state.conversation?.selectedConversation
  );

  const messages = useSelector((state) => state.message?.messages || []);

  if (!selectedConversation) return null;

  const messageCount = messages.length;

  return (
    <header className="sticky top-0 z-20 h-14 w-full bg-[#0D0F14]/80 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 transition-colors">
      
      <div className="flex items-center gap-3 min-w-0 max-w-[70%]">
        <div className="p-2 bg-white/5 rounded-lg shrink-0 hidden sm:block">
          <MessageSquare size={16} className="text-neutral-400" />
        </div>

        <div className="min-w-0">
          <h2 className="text-[14px] sm:text-[15px] font-semibold text-neutral-100 truncate tracking-tight">
            {selectedConversation.title || "Untitled Chat"}
          </h2>

          <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {messageCount} {messageCount === 1 ? "message" : "messages"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {onResetChat && (
          <button 
            onClick={onResetChat}
            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-medium text-neutral-300">
          {isSyncing && <RefreshCw size={12} className="animate-spin text-neutral-400" />}
          <span className="text-[11px] tracking-wide uppercase">AI Assistant</span>
        </div>
      </div>

    </header>
  );
};

export default Nav;