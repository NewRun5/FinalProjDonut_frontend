"use client";

import { useState, FormEvent, ChangeEvent } from 'react';
import styles from '../../styles/Signup.module.css';
import { useRouter } from 'next/navigation';

export default function Signup() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        email: '',
        emailDomain: 'gmail.com'
    });

    const [validationState, setValidationState] = useState({
        passwordMatch: null as boolean | null
    });

    const patterns = {
        username: /^[a-zA-Z0-9]{4,20}$/,
        password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/,
        nickname: /^[a-zA-Z0-9가-힣]{2,10}$/
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
            const match = name === 'confirmPassword' ?
                value === formData.password :
                value === formData.confirmPassword;
            setValidationState(prev => ({ ...prev, passwordMatch: match }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validationState.passwordMatch ||
            !patterns.username.test(formData.username) ||
            !patterns.password.test(formData.password) ||
            !patterns.nickname.test(formData.nickname)) {
            alert('입력한 정보를 다시 확인해주세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                    mutation RegisterUser($input: registerInput!) {
                        registerUser(input: $input)
                    }
                    `,
                    variables: {
                        input: {
                            id: formData.username,
                            password: formData.password,
                            nickname: formData.nickname,
                            email: `${formData.email}@${formData.emailDomain}`
                        }
                    }
                })
            });

            const data = await response.json();

            if (data.data.registerUser) {
                alert('회원가입이 완료되었습니다!');
                router.push('/login');
            } else {
                throw new Error('회원가입 실패');
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f9fc' }}>
            <div style={{ maxWidth: '700px', width: '100%', padding: '30px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ textAlign: 'center', color: '#4a4e69', fontWeight: '700', marginBottom: '25px' }}>회원가입</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>아이디</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="아이디 (영문, 숫자)"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px', flex: '1' }}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8-20자)"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px', width: '100%' }}
                        />
                        {formData.password && !patterns.password.test(formData.password) &&
                            <p className={styles.errorText} style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="비밀번호 재입력"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px', width: '100%' }}
                        />
                        {validationState.passwordMatch === true &&
                            <p className={styles.successText} style={{ color: '#16a34a', fontSize: '12px', marginTop: '5px' }}>비밀번호가 일치합니다.</p>}
                        {validationState.passwordMatch === false &&
                            <p className={styles.errorText} style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>비밀번호가 일치하지 않습니다.</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label>닉네임</label>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임 (2-10자 영문, 숫자, 한글)"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px', flex: '1' }}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>이메일</label>
                        <div className={styles.inputWithButton}>
                            <input
                                type="text"
                                name="email"
                                placeholder="이메일"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px', flex: '1' }}
                            />
                            <span style={{ margin: '0 10px' }}>@</span>
                            <select
                                name="emailDomain"
                                value={formData.emailDomain}
                                onChange={handleChange}
                                style={{ padding: '12px', borderRadius: '8px', border: '2px solid #d1d5db', fontSize: '14px' }}
                            >
                                <option value="gmail.com">gmail.com</option>
                                <option value="naver.com">naver.com</option>
                                <option value="daum.net">daum.net</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.buttons} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <button type="button" onClick={handleCancel} style={{ width: '48%', padding: '12px', backgroundColor: '#4a4e69', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                            취소
                        </button>
                        <button type="submit" style={{ width: '48%', padding: '12px', backgroundColor: '#4a4e69', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.3s ease' }}>
                            회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
