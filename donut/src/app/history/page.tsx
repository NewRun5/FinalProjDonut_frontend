"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // useSearchParams로 수정
import HistoryChat from "@/components/chat/HistoryChat"; // 새로 만든 HistoryChat 컴포넌트
import { fetchChatHistoryByDate } from '@/graphql/queries'; // 날짜에 따른 대화 내역 조회
import "../../styles/history.css"; // 필요시 스타일링 추가

export default function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]); // 대화 내역 상태
  const searchParams = useSearchParams(); // URL에서 파라미터 가져오기
  const date = searchParams.get("date"); // URL에서 date 파라미터 추출

  useEffect(() => {
    const fetchData = async () => {
      if (date) {
        const data = await fetchChatHistoryByDate(date);
        if (data) {
          const formattedData = data.map((chat: any) => ({
            sender: chat.isUser ? 'You' : 'Bot',
            text: chat.content,
          }));
          setChatHistory(formattedData);
        }
      }
    };
    fetchData();
  }, [date]);

  return (
    <div className="history-container">
      <h1>{date} 대화 내역</h1>
      {chatHistory.length > 0 ? (
        <HistoryChat messages={chatHistory} />  // HistoryChat 컴포넌트로 대화 표시
      ) : (
        <p>대화 내역이 없습니다.</p>
      )}
    </div>
  );
}
