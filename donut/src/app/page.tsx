// page.tsx
"use client";

import '../styles/globals.css';
import '../styles/main.css';
import Chat from './components/chat/Chat';
import { useState } from 'react';

export default function Home() {
  const [isMessageSent, setIsMessageSent] = useState(false);

  // 메시지 전송 시 호출되는 함수
  const handleMessageSent = () => {
    setIsMessageSent(true);
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="search-icon">
          <img src="/images/main_logo.svg" alt="Search Icon" />
        </div>
        <h1>나만의 원티드 클래스, DONUT</h1>
      </header>

      {/* <section> 태그에 조건부 렌더링 적용 */}
      <section className="suggestions" style={{ display: isMessageSent ? 'none' : 'block' }}>
        <h2>이런 주제는 어때요?</h2>
        <div className="topic-buttons">
          <button className="topic">물리학에 대해 배우고 싶어.</button>
          <button className="topic">Chat GPT를 실용성 있게 사용하는 방법을 배우고 싶어.</button>
        </div>
      </section>

      {/* Chat 컴포넌트 */}
      <Chat onMessageSent={handleMessageSent} />
    </div>
  );
}
