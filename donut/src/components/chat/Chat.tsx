"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import './chat.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ChatPrompt from '../prompt/Prompt';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/router';

interface Chat {
  isUser: boolean;
  content: string;
}

export default function Chat({ onMessageSent }: { onMessageSent: () => void }) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const botMessagesRef = useRef({ currentBotMessage: 0 });
  const [showLoading, setShowLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chapId, setChapId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const chapIdFromQuery = searchParams.get('chapter');
    setChapId(chapIdFromQuery);

    ws.current = new WebSocket(`ws://localhost:8080/ws-chapter-chat/${chapIdFromQuery || 'none'}`);
    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.current.onmessage = (event) => {
      let receivedData: Chat[] | string;
      try {
        receivedData = JSON.parse(event.data);
      } catch {
        receivedData = event.data;
      }
      console.log(receivedData);
      if (typeof receivedData === "string") {
        setMessages((prev) => [...prev, { sender: 'bot', text: receivedData }]);
      } else {
        const chatList = receivedData.map((res) => ({ sender: res.isUser?'You':'bot', text: res.content }));
        setMessages((prev) => [...prev, ...chatList]);
      }
      setShowLoading(false);
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket connection closed: ', event);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    return () => {
      setMessages([])
      ws.current?.close();
    };
  }, [searchParams]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const sendMessage = (messageText: string) => {
    onMessageSent();
    if (messageText.trim() !== '' && ws.current) {
      ws.current.send(messageText);
      setMessages((prev) => [...prev, { sender: 'You', text: messageText }]);
      setShowLoading(true);
      onMessageSent();
    }
  };

  const scrollToPreviousBotMessage = () => {
    const botMessages = document.querySelectorAll('.chat-message.bot');
    if (botMessages.length > 0 && botMessagesRef.current) {
      const currentBotMessage = botMessagesRef.current.currentBotMessage;
      const previousBotMessage = botMessages[Math.max(currentBotMessage - 1, 0)] as HTMLElement;
      previousBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      botMessagesRef.current.currentBotMessage = Math.max(currentBotMessage - 1, 0);
    }
  };

  const scrollToNextBotMessage = () => {
    const botMessages = document.querySelectorAll('.chat-message.bot');
    if (botMessages.length > 0 && botMessagesRef.current) {
      const currentBotMessage = botMessagesRef.current.currentBotMessage;
      const nextBotMessage = botMessages[Math.min(currentBotMessage + 1, botMessages.length - 1)] as HTMLElement;
      nextBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      botMessagesRef.current.currentBotMessage = Math.min(currentBotMessage + 1, botMessages.length - 1);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsModalVisible(true);
      setTimeout(() => {
        setIsModalVisible(false);
      }, 2000);
    });
  };

  const exportToPDF = async (text: string) => {
    const doc = new jsPDF();
  
    const response = await fetch('/fonts/NotoSans.txt');
    const base64Font = await response.text();
    
    doc.addFileToVFS('NotoSansKR-Regular.ttf', base64Font);
    doc.addFont('NotoSansKR-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    doc.setFontSize(12);
  
    const lines = text.split('\n');
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const maxLineWidth = pageWidth - margin * 2;
  
    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        doc.setFontSize(14);
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('### ', ''), maxLineWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 10;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(16);
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('## ', ''), maxLineWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 12;
      } else if (line.startsWith('# ')) {
        doc.setFontSize(18);
        doc.setFont("NotoSans", "bold");
        const splitText = doc.splitTextToSize(line.replace('# ', ''), maxLineWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 14;
      } else if (line.includes('*')) {
        let currentX = margin;
        const parts = line.split('*');
        parts.forEach((part, index) => {
          const splitText = doc.splitTextToSize(part, maxLineWidth);
          if (index % 2 === 1) {
            doc.setFont("NotoSans", "bold");
          } else {
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
        yPosition += 10;
      } else {
        doc.setFontSize(12);
        doc.setFont("NotoSans", "normal");
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 10;
      }
    });
  
    doc.save("bot_message.pdf");
  };

  return (
    <div className="chat-container">
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
            ref={index === messages.length - 1 ? lastMessageRef : null}
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
                </div>
              </div>
            )}
          </div>
        ))}

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