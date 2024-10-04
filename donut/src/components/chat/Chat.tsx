"use client";

import { useState, useEffect, useRef } from 'react';
import './chat.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
  const [isModalVisible, setIsModalVisible] = useState(false);  // 모달 상태

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
      setIsModalVisible(true);  // 모달 표시
      setTimeout(() => {
        setIsModalVisible(false);  // 2초 후에 모달 숨김
      }, 2000);
    });
  };

  // 한글 PDF 저장 기능
  const exportToPDF = async (text: string) => {
    const doc = new jsPDF();
  
    // 폰트를 동적으로 불러와서 jsPDF에 추가
    const response = await fetch('/fonts/NotoSans.txt'); // public 폴더 내의 폰트 파일
    const base64Font = await response.text(); // Base64 텍스트 파일 읽기
    
    // jsPDF에 한글 폰트 추가
    doc.addFileToVFS('NotoSansKR-Regular.ttf', base64Font);
    doc.addFont('NotoSansKR-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    doc.setFontSize(12);
  
    // 텍스트를 줄 단위로 분할
    const lines = text.split('\n');
    let yPosition = 20;  // 초기 y 위치
    const pageWidth = doc.internal.pageSize.width; // 페이지 너비
    const margin = 10;  // 페이지 좌우 여백
    const maxLineWidth = pageWidth - margin * 2;  // 텍스트를 넣을 최대 너비
  
    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        doc.setFontSize(14);  // 3단계 제목
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('### ', ''), maxLineWidth); // 줄바꿈 처리
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 10;  // 줄 수에 맞게 yPosition 증가
      } else if (line.startsWith('## ')) {
        doc.setFontSize(16);  // 2단계 제목
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('## ', ''), maxLineWidth); // 줄바꿈 처리
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 12;
      } else if (line.startsWith('# ')) {
        doc.setFontSize(18);  // 1단계 제목
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('# ', ''), maxLineWidth); // 줄바꿈 처리
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 14;
      } else if (line.includes('*')) {
        let currentX = margin;
        const parts = line.split('*');
        parts.forEach((part, index) => {
          const splitText = doc.splitTextToSize(part, maxLineWidth); // 줄바꿈 처리
          if (index % 2 === 1) {
            // *로 감싸진 부분은 굵게 설정
            doc.setFont("NotoSans", "bold");
          } else {
            // 일반 텍스트
            doc.setFont("NotoSans", "normal");
          }
          splitText.forEach((textLine) => {
            if (currentX + doc.getTextWidth(textLine) > maxLineWidth) {
              yPosition += 10;
              currentX = margin;
            }
            doc.text(textLine, currentX, yPosition);
            currentX += doc.getTextWidth(textLine);
          });
        });
        yPosition += 10;  // 줄 바꿈
      } else {
        doc.setFontSize(12);
        doc.setFont("NotoSans", "normal");
        const splitText = doc.splitTextToSize(line, maxLineWidth); // 줄바꿈 처리
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 10;  // 줄 수에 맞게 yPosition 증가
      }
    });
  
    // PDF로 저장
    doc.save("bot_message.pdf");
  };
  

  return (
    <div className="chat-container">
      {/* 메시지 모달 창 */}
      {isModalVisible && (
        <div className="modal">
          <span>클립보드에 복사되었습니다.</span>
        </div>
      )}

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
                    <span onClick={() => copyToClipboard(msg.text)}> <img src="./images/copy.svg" alt="copy icon" /></span>
                    <span onClick={() => exportToPDF(msg.text)}> <img src="./images/export.svg" alt="export document icon" /></span>
                  </div>
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
