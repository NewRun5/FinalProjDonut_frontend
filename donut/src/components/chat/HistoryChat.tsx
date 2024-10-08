"use client";

import { useEffect, useRef } from 'react';
import './chat.css'; // 기존 chat 스타일 적용
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ChatProps {
  messages: { sender: string; text: string }[];
}

export default function HistoryChat({ messages }: ChatProps) {
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  // Bot 메시지가 추가될 때마다 마지막 메시지의 시작 부분으로 스크롤
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'You' ? 'user' : 'bot'}`}
            ref={index === messages.length - 1 ? lastMessageRef : null}  // 마지막 메시지에 ref 할당
          >
            {msg.sender === 'You' ? (
              <div className="message user-message">{msg.text}</div>
            ) : (
              <div className="message bot-message">
                <img src="/images/bot_color.svg" alt="Bot Avatar" className="bot-avatar" />
                <div className="message-box">
                  <div className="message-content" style={{ whiteSpace: 'pre-line' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
