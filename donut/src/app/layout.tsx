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
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png">
        <meta name="theme-color" content="#ffffff"></meta>  */}
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
