// components/prompt.tsx
"use client";  // 클라이언트 컴포넌트로 설정
import { useState, useRef, useEffect } from 'react';
import '../styles/prompt.css';  // 프롬프트 관련 CSS 파일 임포트

interface ChatPromptProps {
  onSendMessage: (messageText: string) => void;  // 메시지 전송을 위한 prop
}

export default function ChatPrompt({ onSendMessage }: ChatPromptProps) {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSubmit = () => {
    if (inputText.trim() !== '') {
      onSendMessage(inputText);  // 상위 컴포넌트로 메시지 전달
      setInputText('');  // 제출 후 입력값 초기화
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  // 입력에 따라 textarea의 높이를 자동으로 조정
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';  // 높이를 자동으로 재조정
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // 텍스트 높이만큼 재설정
    }
  }, [inputText]);

  return (
    <div className="prompt">
      <textarea
        ref={textareaRef}
        placeholder="무엇을 배우고 싶으신가요?"
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        className="prompt-textarea"
        rows={1}
      />
      <button className="donut-button" onClick={handleSubmit}>
        <img src="/images/prompt_btn.svg" alt="Donut Icon" />
      </button>
    </div>
  );
}
