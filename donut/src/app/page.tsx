// app/page.tsx (또는 pages/index.tsx)

import './styles/main.css';  // CSS 파일을 임포트
import Chat from './components/Chat';  // Chat 컴포넌트 임포트

export default function Home() {

  return (
    <div className="home-page">
      <header className="header">
        <div className="search-icon">
          <img src="/images/main_logo.svg" alt="Search Icon" />
        </div>
        <h1>나만의 원티드 클래스, DONUT</h1>        
      </header>

      <section className="suggestions">
        <h2>이런 주제는 어때요?</h2>
        <div className="topic-buttons">
          <button className="topic">물리학에 대해 배우고 싶어.</button>
          <button className="topic">Chat GPT를 실용성 있게 사용하는 방법을 배우고 싶어.</button>
        </div>
      </section>

      {/* Chat 컴포넌트 */}
      <Chat />
    </div>
  );
}
