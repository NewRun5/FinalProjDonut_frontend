"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "../modal/Modal";
import { fetchAllChatHistories } from '@/graphql/queries';
import { checkLoginStatus, getAllChapters, getUserBySession, logout } from '@/graphql/graphqlClient';
import "./sidebar.css";

export default function Sidebar({ onToggle }: { onToggle: (isVisible: boolean) => void }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayChats, setTodayChats] = useState<Chap[]>([]);
  const [yesterdayChats, setYesterdayChats] = useState<Chap[]>([]);
  const [olderChats, setOlderChats] = useState<Chap[]>([]);
  const [userInfo, setUserInfo] = useState<{nickname:string} | null>(null);
  const [isLogin, setIsLogin] = useState<boolean | null>(false);



  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data: Chap[] = await getAllChapters();
      if (data) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        console.log(data)
        const todayData = data
          .filter(chap => {
            const chatDate = new Date(chap.createDate ?? new Date());
            return chatDate.toDateString() === today.toDateString();
          })
          .sort((a, b) => new Date(b.createDate ?? new Date()).getTime() - new Date(a.createDate ?? new Date()).getTime());

        // 어제의 대화 내역을 최신순으로 정렬
        const yesterdayData = data
          .filter(chap => {
            const chatDate = new Date(chap.createDate ?? new Date())
            return chatDate.toDateString() === yesterday.toDateString();
          })
          .sort((a, b) => new Date(b.createDate ?? new Date()).getTime() - new Date(a.createDate ?? new Date()).getTime());

        // 7일 전까지의 대화 내역을 최신순으로 정렬
        const olderData = data
          .filter(chap => {
            const chatDate = new Date(chap.createDate ?? new Date())
            return chatDate < yesterday;
          })
          .sort((a, b) => new Date(b.createDate ?? new Date()).getTime() - new Date(a.createDate ?? new Date()).getTime());
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
    const result = async function name() {
      const reulst = await logout()
    }
    result()
    console.log("로그아웃")
    openModal();  // Modal을 열기
  };

  const handleConfirmLogout = () => {
    router.push('/login');  // 로그인 페이지로 이동
  };
  useEffect(() => {
    const fetchLoginStatus = async () => {
      const loginStatus = await checkLoginStatus();
      setIsLogin(loginStatus);
      if (!loginStatus) router.push('/login')
    };

    fetchLoginStatus();
  }, [])
  useEffect(() => {
    if (isLogin) {
      const getUserInfo = async () => {
        const result = await getUserBySession()
        setUserInfo(result)
      }
      getUserInfo();
    }
  }, [isLogin])


  const handleChatClick = (id: number) => {
    router.push("?chapter=" + id)
  };

  return (
    <>
      <aside className={sidebarVisible ? "sidebar" : "sidebar collapsed"}>
        {sidebarVisible ? (
          <>
            <div className="sidebar-header">
              <button className="new-chat-button">
                <span>
                  <Link href="/">
                  <img src="/images/new_chat_btn.svg" alt="create new chat button" />
                  </Link>
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
                    <h2 className="profile-name">{userInfo?.nickname}</h2>
                  </div>
                  <span className="logout_btn" onClick={handleLogout}>
                    <img src="/images/icon_logout_white.png" alt="logout icon" />
                  </span>
                </div>
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
                {todayChats.length > 0 ? todayChats.map(chap => (
                  <li key={chap.id} onClick={() => handleChatClick(chap.id)}>
                    {chap.title}<br/>{new Date(chap.createDate).toLocaleDateString()}
                  </li>
                )) : (
                  <li>대화 내역이 없습니다.</li>
                )}

                <li className="chat_date_tit">어제</li>
                {yesterdayChats.length > 0 ? yesterdayChats.map(chap => (
                  <li key={chap.id} onClick={() => handleChatClick(chap.id)}>
                    {chap.title} - {new Date(chap.createDate).toLocaleDateString()}
                  </li>
                )) : (
                  <li>대화 내역이 없습니다.</li>
                )}

                <li className="chat_date_tit">지난 7일</li>
                {olderChats.length > 0 ? olderChats.map(chap => (
                  <li key={chap.id} onClick={() => handleChatClick(chap.id)}>
                    {chap.title} - {new Date(chap.createDate).toLocaleDateString()}
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
