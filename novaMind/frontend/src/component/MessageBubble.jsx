import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { X } from "lucide-react";

const MessageBubble = ({ role, content, images }) => {
  const isUser = role === "user";
  const [lightBox, setLightBox] = useState(null);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      <div
        className={`prose prose-invert max-w-[80%] rounded-2xl px-5 py-4 overflow-x-auto ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
            : "bg-[#1a1d24] border border-white/10 text-slate-200 rounded-tl-sm"
        }`}
      >
        {images?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {images.map((img, i) => (
              <img
                key={i}
                onClick={() => setLightBox(img)}
                src={img}
                alt={`image-${i}`}
                loading="lazy"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ))}
          </div>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline font-medium"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {lightBox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <button onClick={() => setLightBox(null)}>
            <X />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
