// src/app/components/donutchive/Donutchive.tsx
"use client";

import Sidebar from "../../components/sidebar/Sidebar";  // Sidebar 컴포넌트 임포트 (경로 수정)
import React from "react";
import styles from "../../components/donutchive/donutchive.module.css";  // Donutchive 스타일 임포트
import NoteList from "../NoteList/NoteList";  // NoteList 컴포넌트 임포트

const DonutchivePage = () => {
    const handleSidebarToggle = (isVisible: boolean) => {
        console.log("Sidebar visibility changed:", isVisible);
    };

    return (
        <div className={styles.pageContainer}>
            <Sidebar onToggle={handleSidebarToggle} />
            <div className={styles.content}>
                <NoteList />
            </div>
        </div>
    );
};

export default DonutchivePage;
