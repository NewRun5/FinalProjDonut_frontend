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
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);  // 스크롤 버튼 상태


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
      setIsScrollButtonVisible(true);  // 스크롤 버튼 표시
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

 // Base64 이미지를 불러오는 함수
const loadBase64Image = async () => {
  try {
    const response = await fetch('/images/test2.txt');
    if (!response.ok) {
      throw new Error('Failed to load the Base64 image');
    }
    const base64Image = await response.text(); // test.txt 파일에서 Base64 데이터 불러오기
    return base64Image;
  } catch (error) {
    console.error('Error loading Base64 image:', error);
    return null;  // 오류 발생 시 null 반환
  }
};

// 한글 PDF 저장 기능
const exportToPDF = async (text: string) => {
  const doc = new jsPDF();

  // 폰트를 동적으로 불러와서 jsPDF에 추가
  const fontResponse = await fetch('/fonts/NotoSans.txt'); // public 폴더 내의 폰트 파일
  const base64Font = await fontResponse.text(); // Base64 텍스트 파일 읽기

  // jsPDF에 한글 폰트 추가
  doc.addFileToVFS('NotoSansKR-Regular.ttf', base64Font);
  doc.addFont('NotoSansKR-Regular.ttf', 'NotoSans', 'normal');
  doc.setFont('NotoSans');
  doc.setFontSize(12);

  const margin = 10;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;  // 초기 y 위치
  const maxLineWidth = pageWidth - margin * 2;

  // 텍스트를 줄 단위로 분할
  const lines = text.split('\n');

  // 이미지 불러오기 (Base64 이미지 데이터)
  const base64Image = await loadBase64Image();

  if (!base64Image) {
    console.error('Image loading failed.');
    return;  // 이미지 로딩 실패 시 종료
  }

  for (const line of lines) {
    const splitText = doc.splitTextToSize(line, maxLineWidth);

    // 페이지 높이를 넘을 경우 새로운 페이지 추가
    if (yPosition + splitText.length * 10 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // 텍스트 출력
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * 10; // 줄 수에 따라 yPosition 조정
  }

  // 이미지 추가 (Base64 형식)
  doc.addImage(base64Image, 'JPEG', margin, yPosition, pageWidth - margin * 2, (pageHeight - margin * 2) / 2);

  // PDF로 저장
  doc.save("bot_message.pdf");
};




  // 한글 PDF 저장 기능
  // const exportToPDF = async (text: string) => {
  //   const doc = new jsPDF();
  
  //   // 폰트를 동적으로 불러와서 jsPDF에 추가
  //   const response = await fetch('/fonts/NotoSans.txt'); // public 폴더 내의 폰트 파일
  //   const base64Font = await response.text(); // Base64 텍스트 파일 읽기
  
  //   // jsPDF에 한글 폰트 추가
  //   doc.addFileToVFS('NotoSansKR-Regular.ttf', base64Font);
  //   doc.addFont('NotoSansKR-Regular.ttf', 'NotoSans', 'normal');
  //   doc.setFont('NotoSans');
  //   doc.setFontSize(12);
  
  //   const margin = 10;
  //   const pageHeight = doc.internal.pageSize.height;
  //   const pageWidth = doc.internal.pageSize.width;
  //   let yPosition = 20;  // 초기 y 위치
  //   const maxLineWidth = pageWidth - margin * 2;
  
  //   // 이미지 태그를 추출하는 정규 표현식
  //   const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;  // 마크다운 이미지 태그 추출을 위한 정규 표현식
  
  //   // 텍스트를 줄 단위로 분할
  //   const lines = text.split('\n');
  
  //   for (const line of lines) {
  //     const imageMatch = markdownImageRegex.exec(line);
  
  //     if (imageMatch && imageMatch[1]) {
  //       const imgUrl = imageMatch[1];
  
  //       // 이미지 대신 링크 추가
  //       const linkText = `이미지 링크: ${imgUrl}`;
  //       const splitText = doc.splitTextToSize(linkText, maxLineWidth);
  
  //       // 페이지 높이를 넘을 경우 새로운 페이지 추가
  //       if (yPosition + splitText.length * 10 > pageHeight - margin) {
  //         doc.addPage();
  //         yPosition = margin;
  //       }
  
  //       // 링크 텍스트 출력
  //       doc.text(splitText, margin, yPosition);
  //       yPosition += splitText.length * 10; // 줄 수에 따라 yPosition 조정
  //     } else {
  //       // 이미지가 아닌 텍스트의 경우 처리
  //       const cleanedLine = line.replace(/<\/?div>/g, '');  // 불필요한 div 태그 제거
  //       const splitText = doc.splitTextToSize(cleanedLine, maxLineWidth);
  
  //       // 페이지 높이를 넘을 경우 새로운 페이지 추가
  //       if (yPosition + splitText.length * 10 > pageHeight - margin) {
  //         doc.addPage();
  //         yPosition = margin;
  //       }
  
  //       // 텍스트 출력
  //       doc.text(splitText, margin, yPosition);
  //       yPosition += splitText.length * 10; // 줄 수에 따라 yPosition 조정
  //     }
  //   }
  
  //   // PDF로 저장
  //   doc.save("bot_message.pdf");
  // };
  
  
  // Blob을 Base64로 변환하는 함수
  // const convertBlobToBase64 = (blob) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onloadend = () => resolve(reader.result);
  //     reader.onerror = reject;
  //     reader.readAsDataURL(blob);
  //   });
  // };
  

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

      <div className={`scroll-button-list ${isScrollButtonVisible ? 'visible' : ''}`}>
        <span className="scroll-button-up" onClick={scrollToPreviousBotMessage}>△</span>
        <span className="scroll-button-down" onClick={scrollToNextBotMessage}>▽</span>
      </div>


      <ChatPrompt onSendMessage={sendMessage} />
    </div>
  );
}
