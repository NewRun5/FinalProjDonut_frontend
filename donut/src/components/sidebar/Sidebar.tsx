"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "../modal/Modal";
import { fetchAllChatHistories, fetchUserProfile } from '@/graphql/queries'; // 사용자 정보 가져오기 위한 쿼리 추가
import { logout } from '@/graphql/graphqlClient';
import "./sidebar.css";

export default function Sidebar({ onToggle }: { onToggle: (isVisible: boolean) => void }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayChats, setTodayChats] = useState([]);
  const [yesterdayChats, setYesterdayChats] = useState([]);
  const [olderChats, setOlderChats] = useState([]);
  const [nickname, setNickname] = useState('');  // 사용자 닉네임 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가


  const router = useRouter();

  // 로그인 상태 및 사용자 닉네임 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userProfile = await fetchUserProfile(); // 사용자 정보 가져오기
        if (userProfile) {
          setNickname(userProfile.nickname); // 사용자 닉네임 설정
          setIsLoggedIn(true); // 로그인 상태 true
        } else {
          setIsLoggedIn(false); // 로그인 상태 false
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus(); // 컴포넌트가 마운트될 때 로그인 상태 확인

    // 채팅 기록 가져오기
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

  // 사이드바 토글 기능
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
    onToggle(!sidebarVisible);
  };

  // 로그아웃 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 로그아웃 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };


  const handleLogout = () => {
    openModal();
  };

  // 로그아웃 처리 후 로그인 페이지로 리다이렉트
  const handleConfirmLogout = () => {
    setIsLoggedIn(false);
    router.push("/login");
  };

  // 날짜별 채팅 내역 클릭 시 처리
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
              {isLoggedIn ? (
                  <Link href="#" className="profile-link">
                    <div className="flex_between">
                      <div className="profile-icon">
                        <img src="/images/mypage.svg" alt="mypage icon" />
                        <h2 className="profile-name">{nickname}님</h2>
                      </div>
                      <span className="logout_btn" onClick={handleLogout}>
                      <img src="/images/icon_logout_white.png" alt="logout icon" />
                    </span>
                    </div>
                  </Link>
              ) : (
                  <Link href="/login" className="profile-link">
                    <div className="profile-icon">
                      <img src="/images/mypage.svg" alt="mypage icon" />
                      <h2 className="profile-name">로그인</h2>
                    </div>
                  </Link>
              )}
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

      {/* 로그아웃 모달 */}
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
