"use client";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useChat } from "@ai-sdk/react";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = {
  chatId: number;
};

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      try {
        const response = await axios.post<Message[]>("/api/get-messages", {
          chatId,
        });
        console.log("Chat data", response.data);
        const mes: Message[] = response.data.map(
          (message): Message => ({
            role: message.role,
            content: message.content,
            id: message.id,
          })
        );
        return mes;
      } catch (error) {
        console.error("API Error:", error);
        return [];
      }
    },
  });
  // if (isLoading) {
  //   return <div>Loading messages...</div>;
  // }
  console.log("Chat Dataaaaaaaaa", data);
  const loadingDone = (data ?? []).length > 0 && !isLoading;

  const { input, handleInputChange, handleSubmit, messages, setMessages } =
    useChat({
      api: "/api/chat",
      body: {
        chatId,
      },
      initialMessages: [],
    });
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  React.useEffect(() => {
    if (data && data.length > 0) {
      setMessages(data);
    }
  }, [data, setMessages]);
  // const mes: Message[] = [{ role: 'user' as const, content: 'Hello', id: '1' }];
  console.log("Messages", messages);
  // console.log("Mes", mes);
  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* Messages */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      <MessageList
        messages={messages}
        isLoading={isLoading}
        loadingDone={loadingDone}
      />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white flex "
      >
        <Input
          placeholder="Ask any question..."
          value={input}
          onChange={handleInputChange}
          className="w-full"
        />
        <Button className="bg-blue-600 ml-2">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
