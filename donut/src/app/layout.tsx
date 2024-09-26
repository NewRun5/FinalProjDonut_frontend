// app/layout.tsx

import './globals.css';  // 스타일 파일
import Sidebar from './components/Sidebar';  // Sidebar 컴포넌트 임포트

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>EduCraft DONUT</title>
        <meta name="description" content="EduCraft, DONUT 학습 플랫폼" />
      </head>
      <body>
        <div className="layout">
          {/* 사이드바 컴포넌트 */}
          <Sidebar />

          {/* 메인 콘텐츠 */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
