"use client";

import '../styles/globals.css';  // 스타일 파일
import Sidebar from '../components/sidebar/Sidebar';  // Sidebar 컴포넌트 임포트
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);  // 사이드바 상태 관리
  const pathname = usePathname();  // 현재 경로를 확인

  // 사이드바 상태를 업데이트하는 함수
  const handleSidebarToggle = (isVisible: boolean) => {
    setSidebarVisible(isVisible);
  };

  // 로그인 페이지에서는 사이드바를 숨기고, main 태그의 클래스를 다르게 설정
  const hideSidebarPaths = ['/login', '/signup'];

  const mainClassName = hideSidebarPaths.includes(pathname)
    ? "main-content full"  // 로그인 페이지일 경우
    : sidebarVisible
    ? "main-content expanded"  // 사이드바가 보이는 경우
    : "main-content full";  // 사이드바가 숨겨진 경우

  return (
    <html lang="en">
      <Head>
        <title>EduCraft DONUT</title>
        <link rel="icon" href="/favicon.ico" /> 
        <meta name="description" content="DONUT 학습 플랫폼" />
      </Head>
      <body>
        <div className="layout">
          {/* 로그인 페이지가 아닌 경우에만 사이드바를 표시 */}
          {!hideSidebarPaths.includes(pathname) && (
            <Sidebar onToggle={handleSidebarToggle} />
          )}

          {/* 메인 콘텐츠 - 경로에 따라 클래스 이름이 동적으로 변경 */}
          <main className={mainClassName}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
