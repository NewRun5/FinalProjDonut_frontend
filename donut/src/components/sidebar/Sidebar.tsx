"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "../modal/Modal";
import { fetchAllChatHistories } from '@/graphql/queries';
import { logout } from '@/graphql/graphqlClient';
import "./sidebar.css";

export default function Sidebar({ onToggle }: { onToggle: (isVisible: boolean) => void }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayChats, setTodayChats] = useState([]);
  const [yesterdayChats, setYesterdayChats] = useState([]);
  const [olderChats, setOlderChats] = useState([]);


  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllChatHistories();
      if (data) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // 오늘의 대화 내역을 최신순으로 정렬
        const todayData = data
          .filter(chat => {
            const chatDate = new Date(chat.createDate);
            return chatDate.toDateString() === today.toDateString();
          })
          .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

        // 어제의 대화 내역을 최신순으로 정렬
        const yesterdayData = data
          .filter(chat => {
            const chatDate = new Date(chat.createDate);
            return chatDate.toDateString() === yesterday.toDateString();
          })
          .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

        // 7일 전까지의 대화 내역을 최신순으로 정렬
        const olderData = data
          .filter(chat => {
            const chatDate = new Date(chat.createDate);
            return chatDate < yesterday;
          })
          .sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

        setTodayChats(todayData);
        setYesterdayChats(yesterdayData);
        setOlderChats(olderData);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    onToggle(!sidebarVisible);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    openModal();
  };

  // 로그아웃 요청 및 리다이렉트 처리
  const handleConfirmLogout = async () => {
    const result = await logout();
    if (result) {
      router.push("/login");  // 로그아웃 성공 시 로그인 페이지로 이동
    }
  };


  const handleChatClick = (date: string) => {
    // 'T'는 URL에 포함되면 안 되므로 제거
    const formattedDate = date.split("T")[0];
    router.push(`/history?date=${formattedDate}`);  // 클릭한 날짜로 페이지 이동
  };

  return (
    <>
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
                <div className="flex_between">
                  <div className="profile-icon">
                    <img src="/images/mypage.svg" alt="mypage icon" />
                    <h2 className="profile-name">도넛또넛님</h2>
                  </div>
                  <span className="logout_btn" onClick={handleLogout}>
                    <img src="/images/icon_logout_white.png" alt="logout icon" />
                  </span>
                </div>
              </Link>
              <Link href="/study">
                <span className="learn-link">학습 하러 가기</span>
              </Link>
            </div>
            <div className="archive_box">
              <Link href="#" className="archive_btn">
                <img src="/images/archive.svg" alt="archive icon" />
                <h2>DONUTCHIVE</h2>
              </Link>
            </div>
            <nav className="sidebar-nav">
              <ul>
                <li className="chat_date_tit">오늘</li>
                {todayChats.length > 0 ? todayChats.map(chat => (
                  <li key={chat.id} onClick={() => handleChatClick(chat.createDate)}>
                    {chat.content} - {new Date(chat.createDate).toLocaleDateString()}
                  </li>
                )) : (
                  <li>대화 내역이 없습니다.</li>
                )}

                <li className="chat_date_tit">어제</li>
                {yesterdayChats.length > 0 ? yesterdayChats.map(chat => (
                  <li key={chat.id} onClick={() => handleChatClick(chat.createDate)}>
                    {chat.content} - {new Date(chat.createDate).toLocaleDateString()}
                  </li>
                )) : (
                  <li>대화 내역이 없습니다.</li>
                )}

                <li className="chat_date_tit">지난 7일</li>
                {olderChats.length > 0 ? olderChats.map(chat => (
                  <li key={chat.id} onClick={() => handleChatClick(chat.createDate)}>
                    {chat.content} - {new Date(chat.createDate).toLocaleDateString()}
                  </li>
                )) : (
                  <li>대화 내역이 없습니다.</li>
                )}
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
      {isModalOpen && (
        <Modal
          title="로그아웃"
          message="로그아웃 되었습니다"
          onClose={closeModal}
          onConfirm={handleConfirmLogout}
          icon="/images/icon_group_modal_check.svg"
        />
      )}
    </>
  );
}
