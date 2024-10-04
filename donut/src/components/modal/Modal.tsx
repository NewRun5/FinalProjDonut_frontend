// src/app/components/Modal.tsx
import React from 'react';
import './modal.css';  // 스타일 파일 따로 적용

interface ModalProps {
  title: string;      // h2 태그의 제목을 위한 새로운 프로퍼티
  message: string;    // 모달에 표시할 메시지
  onClose: () => void; // 모달을 닫는 함수
}

const Modal: React.FC<ModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="modalBackground">
      <div className="modalContent">
        <div className="modalIcon">
          <img src="./images/icon_group_modal_bang.svg" alt="bang icon" />
        </div>  {/* 아이콘 */}
        <h2>{title}</h2>
        <p>{message}</p>
        <button className="modalButton" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default Modal;
