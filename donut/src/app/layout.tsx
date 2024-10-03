"use client";

import './globals.css';  // 스타일 파일
import Sidebar from './components/sidebar/Sidebar';  // Sidebar 컴포넌트 임포트
import { useState } from 'react';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);  // 사이드바 상태 관리

  // 사이드바 상태를 업데이트하는 함수
  const handleSidebarToggle = (isVisible: boolean) => {
    setSidebarVisible(isVisible);
  };

  return (
    <html lang="en">
      <Head>
        <title>EduCraft DONUT</title>
        <link rel="icon" href="/favicon.ico" /> 
        <meta name="description" content="DONUT 학습 플랫폼" />
      </Head>
      <body>
        <div className="layout">
          {/* 사이드바 컴포넌트 */}
          <Sidebar onToggle={handleSidebarToggle} />

          {/* 메인 콘텐츠 */}
          <main className={sidebarVisible ? "main-content expanded" : "main-content full"}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
