import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import sendMessage from "../features/sendMessage";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setMessages } from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import { updateConversation } from "../features/updateConversation";
import {
  addConversation,
  setConvTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { useRef } from "react";

const ChatInput = () => {
  const [value, setValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Auto");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const agents = [
    {
      id: "auto",
      icon: Zap,
      label: "Auto",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      id: "coding",
      icon: Code2,
      label: "coding",
    },

    {
      id: "pdf",
      icon: FileText,
      label: "pdf",
    },
    {
      id: "ppt",
      icon: Presentation,
      label: "PPT",
    },
    {
      id: "vision",
      icon: ImageIcon,
      label: "vision",
    },
    {
      id: "search",
      icon: Globe,
      label: "Search",
    },
  ];
  const handleSendMessage = async () => {
    try {
      let conversation = selectedConversation;

      if (!conversation) {
        conversation = await createConversation();
        dispatch(setSelectedConversation(conversation));
        dispatch(addConversation(conversation));
      }

      const prompt = value.trim();
      if (!prompt && !selectedFile) return;

      if (conversation.title === "New Chat") {
        await updateConversation({
          id: conversation._id,
          title: prompt || "New Chat",
        });

        dispatch(
          setConvTitle({
            conversationId: conversation._id,
            title: prompt || "New Chat",
          }),
        );
      }

      dispatch(
        addMessage({
          role: "user",
          content: prompt,
        }),
      );

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("conversationId", conversation._id);
      formData.append("agent", selectedAgent.toLowerCase());
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      setValue("");
      const fileToClear = selectedFile;
      setSelectedFile(null);

      const data = await sendMessage(formData);

      console.log("API RESPONSE:", data);

      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer || "",
          images: data?.images || [],
        }),
      );

      let artifacts = [];
      if (Array.isArray(data)) {
        const latestArtifactsMessage = [...data]
          .reverse()
          .find((msg) => msg?.artifacts && msg.artifacts.length > 0);
        artifacts = latestArtifactsMessage?.artifacts || [];
      } else if (data?.artifacts) {
        artifacts = data.artifacts;
      }

      dispatch(setArtifacts(artifacts));
    } catch (error) {
      console.error(error);
      dispatch(
        addMessage({
          role: "assistant",
          content: "Something went wrong.",
        }),
      );
    }
  };
  return (
    <div className="w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] bg-[#0dof14]">
      <div className="flex flex-co; gap-2 bg-white/[0.06] border border-white/[0.07] rounded-2xl px-4 pt-3.5 pb-3">
        <div className="flex w-[80%] gap-2 pr-2 flex-wrap">
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label;
            const Icon = agent.icon;
            return (
              <div
                onClick={() => setSelectedAgent(agent.label)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all duration-300  cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30"
                    : "bg-[#171A21] text-gray-400 border-white/10 hover:bg-[#20242D] hover:text-white"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-white" : "text-slate-500"}
                />
                {agent.label}
              </div>
            );
          })}
        </div>
        {selectedFile && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Paperclip size={16} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">
                {selectedFile?.name}
              </p>
              <p className="text-[10px] text-slate-500">
                {Math.ceil(selectedFile.size / 1024)} KB
              </p>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white active:scale-95 shrink-0"
              title="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <textarea
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
    disabled:opacity-50"
          placeholder="Ask anything"
          rows={3}
        />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <input
              type="file"
              accept=".pdf,image/*"
              hidden
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            <button
              onClick={() => fileRef.current.click()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white active:scale-95"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>
        
          </div>

          <button
            disabled={value.length == 0}
            onClick={handleSendMessage}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            title="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
