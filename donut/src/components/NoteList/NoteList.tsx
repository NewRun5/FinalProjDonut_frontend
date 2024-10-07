// src/app/components/NoteList.tsx
"use client";  // Next.js에서 클라이언트 측에서 실행되게 지정

import React from "react";
// @ts-ignore
import styles from "./NoteList.module.css";  // CSS 파일 임포트
import Link from "next/link";  // 링크 연결을 위한 next/link 사용

const NoteList = () => {
    return (
        <div className={styles.noteListContainer}>
            <header className={styles.header}>
                <div className={styles.title}>
                    <img src="/images/donutchive.svg" alt="DONUTCHIVE" className={styles.logo} />
                    <Link href="#">my 노트</Link>
                    <Link href="#">중요 노트</Link>
                    <button className={styles.noteFinder}>내 노트 찾기</button>
                </div>
                <div className={styles.filterContainer}>
                    <button className={styles.addButton}>+</button>
                    <select className={styles.filterSelect}>
                        <option>최신순</option>
                        <option>오래된순</option>
                    </select>
                    <select className={styles.filterSelect}>
                        <option>전체</option>
                        <option>카테고리 1</option>
                        <option>카테고리 2</option>
                    </select>
                </div>
            </header>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>NO</th>
                    <th>위치</th>
                    <th>문서명</th>
                    <th>생성일</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>my 노트</td>
                    <td>물리학에 대해 배우고 싶어</td>
                    <td>2024-08-29</td>
                    <td>
                        <button>
                            <img src="/images/download_icon.svg" alt="다운로드" />
                        </button>
                        <button>
                            <img src="/images/delete_icon.svg" alt="삭제" />
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>

            <footer className={styles.pagination}>
                <button>&lt;</button>
                <span>1</span>
                <button>&gt;</button>
            </footer>
        </div>
    );
};

export default NoteList;
