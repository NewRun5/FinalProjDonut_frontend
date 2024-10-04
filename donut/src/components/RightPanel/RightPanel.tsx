"use client";

import { useState, useRef, useEffect } from 'react';
import ChatPrompt from '../prompt/Prompt';

export default function Chat({ onMessageSent }: { onMessageSent: () => void }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket('ws://new-url-for-chat');  // 새로운 WebSocket URL

    ws.current.onmessage = (event) => {
      setTimeout(() => {
        setShowLoading(false);
        setMessages((prev) => [...prev, { sender: 'Bot', text: event.data }]);
      }, 2000);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (messageText: string) => {
    if (messageText.trim() !== '' && ws.current) {
      ws.current.send(messageText);
      setMessages((prev) => [...prev, { sender: 'You', text: messageText }]);
      setShowLoading(true);
      onMessageSent();
    }
  };

  return (
    <div className="chat-container">
      {/* 메시지 리스트 */}
      {messages.map((msg, index) => (
        <div key={index} className={`chat-message ${msg.sender === 'You' ? 'user' : 'bot'}`}>
          {msg.text}
        </div>
      ))}

      {/* 프롬프트 컴포넌트 */}
      <ChatPrompt onSendMessage={sendMessage} />
    </div>
  );
}
