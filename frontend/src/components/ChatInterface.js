import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { sendMessage } from "../services/api";
import { v4 as uuidv4 } from "uuid";

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      text: "Hello! I'm your DeepSeek R1T2 Chimera assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      reasoning: null,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [showReasoning, setShowReasoning] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      text: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessage(inputValue, sessionId, messages);

      const botMessage = {
        id: uuidv4(),
        text: response.message,
        sender: "bot",
        timestamp: new Date().toISOString(),
        reasoning: response.reasoning || null,
        usage: response.usage || null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: uuidv4(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: uuidv4(),
        text: "Chat cleared! How can I help you?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="chat-interface">
      <div className="chat-controls">
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className={`toggle-reasoning ${showReasoning ? "active" : ""}`}
        >
          {showReasoning ? "Hide Reasoning" : "Show Reasoning"}
        </button>
        <button onClick={clearChat} className="clear-chat">
          Clear Chat
        </button>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            showReasoning={showReasoning}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="input-form">
        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
