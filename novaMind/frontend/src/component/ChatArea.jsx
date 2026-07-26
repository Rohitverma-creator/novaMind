import React, { useEffect } from "react";
import MessageList from "./MessageList";
import getMessage from "../features/getMessages.js";
import ChatInput from "./ChatInput";
import Nav from "./Nav";
import { useDispatch, useSelector } from "react-redux";
import { setArtifacts, setMessages } from "../redux/messageSlice";

const ChatArea = () => {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const dispatch = useDispatch();
  useEffect(() => {
    const getMessages = async () => {
      
      if (selectedConversation) {
        if(selectedConversation.title=="New Chat") return
        const data = await getMessage(selectedConversation?._id);
        dispatch(setMessages(data));
        dispatch(setArtifacts(data.artifacts|| []))
      }
    };
    getMessages();
  }, [selectedConversation?._id]);
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatArea;
