import React from "react";
import { useSelector } from "react-redux";
import { Sparkles, Code, Server, LayoutDashboard } from "lucide-react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ onPromptClick }) => {
  const selectedConversation = useSelector(
    (state) => state.conversation?.selectedConversation,
  );
  const messages = useSelector((state) => state.message?.messages || []);

  const starterPrompts = [
    {
      text: "Write a netflix clone",
      icon: <Code size={18} className="text-blue-400" />,
    },
    {
      text: "Explain Redis",
      icon: <Server size={18} className="text-rose-400" />,
    },
    {
      text: "Build a dashboard",
      icon: <LayoutDashboard size={18} className="text-amber-400" />,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#0D0F14]">
      {!selectedConversation ? (
        <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col justify-center items-center text-center px-4">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              NovaMind AI
            </h1>
            <p className="mt-3 text-lg text-neutral-400 font-medium">
              How can I help you today?
            </p>
            <p className="mt-1 text-sm text-neutral-500 max-w-sm mx-auto">
              Ask me anything—code, ideas, explanations, or just a random
              thought.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
            {starterPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptClick && onPromptClick(prompt.text)}
                className="flex sm:flex-col items-center sm:items-start justify-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 text-left transition-all duration-200 group text-neutral-300"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  {prompt.icon}
                </div>
                <span className="text-[13px] font-medium leading-tight truncate sm:whitespace-normal">
                  {prompt.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
              Start a new conversation...
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                role={msg.role}
                content={msg.content}
                images={msg.images || []} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MessageList;
