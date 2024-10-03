import { useState, useEffect, useRef } from 'react';
import './chat.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';  // HTML 태그를 처리하는 플러그인
import remarkGfm from 'remark-gfm';
import ChatPrompt from '../prompt/Prompt';
import { jsPDF } from 'jspdf';  // PDF 생성 라이브러리

export default function Chat({ onMessageSent }: { onMessageSent: () => void }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);  // 마지막 메시지에 대한 참조
  const botMessagesRef = useRef({ currentBotMessage: 0 });
  const [showLoading, setShowLoading] = useState(false);

  // WebSocket 메시지 수신 처리
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080/ws-chat');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.current.onmessage = (event) => {
      console.log('Message received from WebSocket: ', event.data);

      setTimeout(() => {
        setShowLoading(false);  // 답변 생성 중 상태 비활성화
        setMessages((prev) => [...prev, { sender: 'Bot', text: event.data }]);
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

  // Bot 메시지가 추가될 때마다 마지막 메시지의 시작 부분으로 스크롤
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const sendMessage = (messageText: string) => {
    if (messageText.trim() !== '' && ws.current) {
      ws.current.send(messageText);
      setMessages((prev) => [...prev, { sender: 'You', text: messageText }]);
      setShowLoading(true);  // 답변 생성 중 상태 활성화
      onMessageSent();
    }
  };

  const scrollToPreviousBotMessage = () => {
    const botMessages = document.querySelectorAll('.chat-message.bot');
    if (botMessages.length > 0 && botMessagesRef.current) {
      const currentBotMessage = botMessagesRef.current.currentBotMessage;
      const previousBotMessage = botMessages[Math.max(currentBotMessage - 1, 0)];
      previousBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      botMessagesRef.current.currentBotMessage = Math.max(currentBotMessage - 1, 0);
    }
  };

  const scrollToNextBotMessage = () => {
    const botMessages = document.querySelectorAll('.chat-message.bot');
    if (botMessages.length > 0 && botMessagesRef.current) {
      const currentBotMessage = botMessagesRef.current.currentBotMessage;
      const nextBotMessage = botMessages[Math.min(currentBotMessage + 1, botMessages.length - 1)];
      nextBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      botMessagesRef.current.currentBotMessage = Math.min(currentBotMessage + 1, botMessages.length - 1);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("메시지가 클립보드에 복사되었습니다!");
    });
  };

  const exportToPDF = (text: string) => {
    const doc = new jsPDF();
    doc.text(text, 10, 10);
    doc.save("bot_message.pdf");
  };

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
                <div className="message-content" style={{ whiteSpace: 'pre-line' }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}  // GitHub Flavored Markdown(GFM)을 지원하기 위한 플러그인 설정
                    rehypePlugins={[rehypeRaw]}  // HTML 태그를 직접 처리할 수 있게 해주는 rehypeRaw 플러그인 추가
                    components={{
                      h1: ({ children, ...props }) => <h1 className="heading-1" {...props}>{children}</h1>,  
                      h2: ({ children, ...props }) => <h2 className="heading-2" {...props}>{children}</h2>,  
                      h3: ({ children, ...props }) => <h3 className="heading-3" {...props}>{children}</h3>,  
                      h4: ({ children, ...props }) => <h4 className="heading-4" {...props}>{children}</h4>,  
                      p: ({ children, ...props }) => <p className="paragraph" {...props}>{children}</p>,  
                      strong: ({ children, ...props }) => <strong className="bold-text" {...props}>{children}</strong>  
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
                {/* 복사 및 PDF 내보내기 버튼 추가 */}
                <div className="message-actions">
                  <button onClick={() => copyToClipboard(msg.text)}>복사</button>
                  <button onClick={() => exportToPDF(msg.text)}>PDF로 내보내기</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 로딩 표시 JSX 추가 */}
        <div className={`loading-container ${showLoading ? 'show' : ''}`}>
          <span>답변 생성 중</span>
          <div className="loading-donuts">
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 1" />
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 2" />
            <img src="/images/bot_white.svg" className="donut" alt="loading donut 3" />
          </div>
        </div>
      </div>

      <div className='scroll-button-list'>
        <span
          className="scroll-button-up"
          onClick={scrollToPreviousBotMessage}
        >△</span>

        <span
          className="scroll-button-down"
          onClick={scrollToNextBotMessage}
        >▽</span>
      </div>

      <ChatPrompt onSendMessage={sendMessage} />
    </div>
  );
}
