// app/page.tsx (또는 pages/index.tsx)
import './styles/main.css';  // CSS 파일을 임포트
import ChatPrompt from './components/Prompt';  // ChatPrompt 컴포넌트 임포트

export default function Home() {
  return (
    <div className="home-page">
      <header className="header">
        <div className="search-icon">
          <img src="/images/main_logo.svg" alt="Search Icon" />
        </div>
        <h1>여러분의 EduCraft, DONUT</h1>        
      </header>

      <section className="suggestions">
        <h2>이런 주제는 어때요?</h2>
        <div className="topic-buttons">
          <button className="topic">물리학에 대해 배우고 싶어.</button>
          <button className="topic">Chat GPT를 실용성 있게 사용하는 방법을 배우고 싶어.</button>
        </div>
      </section>

      {/* <div className="prompt">
        <input type="text" placeholder="무엇을 배우고 싶으신가요?" />
        <button className="donut-button">
          <img src="/images/prompt_btn.svg" alt="Donut Icon" />
        </button>
      </div> */}
      {/* 프롬프트 영역 */}
      <ChatPrompt />
    </div>
  );
}
