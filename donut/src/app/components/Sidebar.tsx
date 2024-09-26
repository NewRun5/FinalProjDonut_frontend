"use client";

import { useState } from 'react';
import Link from 'next/link';
import '../styles/sidebar.css';  // Sidebar 관련 스타일을 가져옴

export default function Sidebar({ onToggle }: { onToggle: (isVisible: boolean) => void }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    onToggle(!sidebarVisible);  // 부모 컴포넌트에 사이드바 상태 전달
  };

  return (
    <aside className={sidebarVisible ? "sidebar" : "sidebar collapsed"}>
      {sidebarVisible ? (
        <>
          <div className="sidebar-header">
            <button className="new-chat-button">
              <span>
                <img src="/images/new_chat_btn.svg" alt="create new chat button" />
              </span>
            </button>
            <button className="toggle-button" onClick={toggleSidebar}>
              <span>
                <img src="/images/sidebar.svg" alt="close sidebar button" />
              </span>
            </button>
          </div>
          <div className="sidebar-user">
            <Link href="#" className="profile-link">
              <div className="profile-icon">
                <img src="/images/mypage.svg" alt="mypage icon" />
                <h2 className="profile-name">도넛또넛님</h2>
              </div>
            </Link>
          </div>
          <div>
            <Link href="#" className="archive_btn">
              <img src="/images/archive.svg" alt="archive icon" />
              <h2>DONUTCHIVE</h2>
            </Link>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li>오늘<br />AI 활용하는 법을 배우고 싶어.</li>
              <li>어제<br />Chat GPT를 실용성 있게 사용하는 방법을 배우고 싶어.</li>
              <li>지난 7일<br />물리학에 대해 배우고 싶어.</li>
            </ul>
          </nav>
        </>
      ) : (
        <div className="collapsed-icons">
          <button className="new-chat-button">
            <img src="/images/new_chat_btn.svg" alt="create new chat button" />
          </button>
          <button className="profile-icon">
            <img src="/images/mypage.svg" alt="mypage icon" />
          </button>
          <button className="archive_btn">
            <img src="/images/archive.svg" alt="archive icon" />
          </button>
          <button className="toggle-button" onClick={toggleSidebar}>
            <img src="/images/sidebar.svg" alt="expand sidebar button" />
          </button>
        </div>
      )}
    </aside>
  );
}
