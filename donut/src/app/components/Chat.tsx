"use client";  // 클라이언트 컴포넌트로 설정
import { useState, useEffect, useRef } from 'react';
import '../styles/chat.css';  // CSS 파일 임포트
import ChatPrompt from './Prompt';  // ChatPrompt 컴포넌트 임포트

// Chat.tsx
export default function Chat({ onMessageSent }: { onMessageSent: () => void }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [showLoading, setShowLoading] = useState(false);  // 답변 생성 중 상태

  // WebSocket 메시지 수신 처리
useEffect(() => {
  ws.current = new WebSocket('ws://localhost:8080/ws-chat');

  ws.current.onopen = () => {
    console.log('Connected to WebSocket');
  };

  ws.current.onmessage = (event) => {
    console.log('Message received from WebSocket: ', event.data);

    // 2000ms 동안 로딩 상태를 유지한 후 메시지를 표시
    setTimeout(() => {
      setShowLoading(false);  // 답변 생성 중 상태 비활성화
      // 줄바꿈 처리 (event.data의 줄바꿈을 <br />로 변환)
      const formattedMessage = event.data.replace(/\n/g, '<br />');
      setMessages((prev) => [...prev, { sender: 'Bot', text: formattedMessage }]);
      scrollToBottom();
    }, 2000);
  };

  ws.current.onclose = (event) => {
    console.log('WebSocket connection closed: ', event);
  };

  ws.current.onerror = (error) => {
    console.error('WebSocket error: ', error);
  };

  return () => {
    ws.current?.close(); // 컴포넌트가 언마운트될 때 WebSocket을 닫음
  };
}, []);

  // 메시지 전송 함수 수정
const sendMessage = (messageText: string) => {
  if (messageText.trim() !== '' && ws.current) {
    ws.current.send(messageText);
    setMessages((prev) => [...prev, { sender: 'You', text: messageText }]);
    scrollToBottom();
    setShowLoading(true);  // 답변 생성 중 상태 활성화
    onMessageSent();  // 상위 컴포넌트에 메시지 전송 상태 전달
  }
};

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender === 'You' ? 'user' : 'bot'}`}>
            {msg.sender === 'You' ? (
              <div className="message user-message">{msg.text}</div>
            ) : (
              <div className="message bot-message">
                <img src="/images/bot_color.svg" alt="Bot Avatar" className="bot-avatar" />
                <span>{msg.text}</span>
              </div>
            )}
          </div>
        ))}
        {/* // 로딩 표시 JSX 추가 */}
        <div className={`loading-container ${showLoading ? 'show' : ''}`}>
          <span>답변 생성 중</span>
          <div className="loading-donuts">
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 1" />
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 2" />
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 3" />
          </div>
        </div>
      </div>

      <ChatPrompt onSendMessage={sendMessage} />
    </div>
  );
}

