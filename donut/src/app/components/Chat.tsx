"use client";  // 클라이언트 컴포넌트로 설정
import { useState, useEffect, useRef } from 'react';
import '../styles/chat.css';  // CSS 파일 임포트
import ChatPrompt from './Prompt';  // ChatPrompt 컴포넌트 임포트

export default function Chat() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [isMessageSent, setIsMessageSent] = useState(false);  // 메시지 전송 여부 상태
  const ws = useRef<WebSocket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // WebSocket 연결
    ws.current = new WebSocket('ws://localhost:8080/ws-chat');  // 실제 WebSocket URL로 교체

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: 'Bot', text: event.data }]);
      scrollToBottom();
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (messageText: string) => {
    if (messageText.trim() !== '' && ws.current) {
      // WebSocket을 통해 메시지 전송
      ws.current.send(messageText);

      // 사용자가 보낸 메시지를 로컬에서 바로 보여줌
      setMessages((prev) => [...prev, { sender: 'You', text: messageText }]);
      scrollToBottom();
      setIsMessageSent(true);  // 메시지가 전송되었음을 표시
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-container">
      <div 
        className="chat-messages" 
        ref={chatMessagesRef} 
        style={{ minHeight: isMessageSent ? '400px' : '0' }}  // 메시지 전송 여부에 따라 높이 변경
      >
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === 'You' ? 'user' : 'bot'}`}>
            {msg.sender === 'You' ? (
              <div className="message user-message">
                {msg.text}
              </div>
            ) : (
              <div className="message bot-message">
                <img src="/images/bot_color.svg" alt="Bot Avatar" className="bot-avatar" />
                <span>{msg.text}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ChatPrompt 컴포넌트 사용 */}
      <ChatPrompt onSendMessage={sendMessage} />
    </div>
  );
}
