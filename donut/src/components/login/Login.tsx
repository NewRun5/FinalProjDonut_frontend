// src/app/components/login/Login.tsx
"use client";

import React, { useState } from 'react';
import Modal from '../modal/Modal';  // Modal 컴포넌트 임포트
import { useRouter } from 'next/navigation';  // 메인 페이지 이동을 위한 next.js router 사용
import '../../styles/globals.css';
import styles from './Login.module.css';
import { login } from '@/graphql/graphqlClient';  // GraphQL 클라이언트 함수 가져오기


const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();  // next.js의 router 사용

  const handleLogin = async () => {
    if (id === "") {
      setErrorMessage("아이디를 입력해 주세요.");
      setIsModalOpen(true);
    } else if (password === "") {
      setErrorMessage("비밀번호를 입력해 주세요.");
      setIsModalOpen(true);
      return;
    }
    // GraphQL 요청을 통해 백엔드로 로그인 시도
    try {
      const result = await login(id, password);
      if (result.login) {
        // 로그인 성공 시 메인 페이지로 이동
        router.push('/');
      } else {
        setErrorMessage('아이디 또는 비밀번호를 다시 확인해주세요.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('서버와의 통신 중 오류가 발생했습니다.');
      setIsModalOpen(true);
    }
  };


  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <img src="/images/main_logo.svg" alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Login</h1>

        <form action="/login" method="POST">
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={styles.inputField}
            />
          </div>
  
          <div className={styles.inputContainer}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              autoComplete='current-password'
            />
          </div>
        </form>

        <div className={styles.helpLinks}>
          <a href="#">아이디 찾기</a> | <a href="#">비밀번호 찾기</a>
        </div>

        <button className={styles.loginButton} onClick={handleLogin}>
          로그인
        </button>

        <div className={styles.signUp_box}>
          <p className={styles.signUp_txt}>아직 DONUT 회원이 아니신가요?</p>
  
          <div className={styles.helpLinks}>
            <a href="#">회원가입</a>
          </div>
        </div>
        

        {isModalOpen && (
          <Modal title="로그인 실패" message={errorMessage} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default Login;
