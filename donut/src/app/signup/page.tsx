"use client";

import { useState, FormEvent, ChangeEvent, ReactNode } from 'react';
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
        emailDomain: 'gmail.com',
        verificationCode: ''
    });

    const [validationState, setValidationState] = useState({
        isUsernameAvailable: null as boolean | null,
        isNicknameAvailable: null as boolean | null,
        isEmailVerified: false,
        passwordMatch: null as boolean | null,
        verificationError: false
    });

    const [messages, setMessages] = useState({
        emailSent: null as ReactNode | null,
        verification: null as ReactNode | null
    });

    const [isLoading, setIsLoading] = useState(false);

    // Validation patterns
    const patterns = {
        username: /^[a-zA-Z0-9]{4,20}$/,
        password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/,
        nickname: /^[a-zA-Z0-9가-힣]{2,10}$/
    };

    // Handle input changes
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Password match validation
        if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
            const match = name === 'confirmPassword' ?
                value === formData.password :
                value === formData.confirmPassword;
            setValidationState(prev => ({ ...prev, passwordMatch: match }));
        }
    };

    // Username availability check
    const handleCheckUsername = async () => {
        if (!patterns.username.test(formData.username)) {
            alert('아이디는 4-20자의 영문자와 숫자만 사용 가능합니다.');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/signup/check-username?username=${formData.username}`
            );
            const data = await response.json();
            setValidationState(prev => ({ ...prev, isUsernameAvailable: data.available }));
        } catch (error) {
            console.error('Error:', error);
            setValidationState(prev => ({ ...prev, isUsernameAvailable: false }));
        }
    };

    // Nickname availability check
    const handleCheckNickname = async () => {
        if (!patterns.nickname.test(formData.nickname)) {
            alert('닉네임은 2-10자의 영문자, 숫자, 한글만 사용 가능합니다.');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/signup/check-nickname?nickname=${formData.nickname}`
            );
            const data = await response.json();
            setValidationState(prev => ({ ...prev, isNicknameAvailable: data.available }));
        } catch (error) {
            console.error('Error:', error);
            setValidationState(prev => ({ ...prev, isNicknameAvailable: false }));
        }
    };

    // Email verification code request
    const handleEmailVerification = async () => {
        setIsLoading(true);
        setMessages(prev => ({ ...prev, emailSent: null }));

        try {
            const response = await fetch('http://localhost:8080/signup/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${formData.email}@${formData.emailDomain}`
                })
            });
            const data = await response.json();

            setMessages(prev => ({
                ...prev,
                emailSent: <span style={{ color: 'green' }}>{data.message}</span>
            }));
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => ({
                ...prev,
                emailSent: <span style={{ color: 'red' }}>이메일 발송 중 오류가 발생했습니다.</span>
            }));
        } finally {
            setIsLoading(false);
        }
    };

    // Verify email code
    const handleVerification = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/signup/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${formData.email}@${formData.emailDomain}`,
                    code: formData.verificationCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => ({
                    ...prev,
                    verification: <p style={{ color: 'green' }}>인증 완료</p>
                }));
                setValidationState(prev => ({ ...prev, isEmailVerified: true }));
            } else {
                setMessages(prev => ({
                    ...prev,
                    verification: <p style={{ color: 'red' }}>잘못된 인증 코드입니다</p>
                }));
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => ({
                ...prev,
                verification: <p style={{ color: 'red' }}>인증 실패</p>
            }));
        } finally {
            setIsLoading(false);
        }
    };

    // Form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validation checks
        if (!validationState.isUsernameAvailable ||
            !validationState.isNicknameAvailable ||
            !validationState.isEmailVerified) {
            alert('아이디/닉네임 중복확인과 이메일 인증이 필요합니다.');
            return;
        }

        if (!validationState.passwordMatch ||
            !patterns.username.test(formData.username) ||
            !patterns.password.test(formData.password) ||
            !patterns.nickname.test(formData.nickname)) {
            setValidationState(prev => ({ ...prev, verificationError: true }));
            alert('입력한 정보를 다시 확인해주세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    nickname: formData.nickname,
                    email: `${formData.email}@${formData.emailDomain}`,
                    verificationCode: formData.verificationCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('회원가입이 완료되었습니다!');
                router.push('/login'); // 로그인 페이지로 이동
            } else {
                throw new Error(data.message || '회원가입 실패');
            }
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push('/'); // 메인 페이지로 이동
    };

    return (
        <div className={styles.container}>
            <h1>회원가입</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* 아이디 입력 */}
                <div className={styles.inputGroup}>
                    <label>아이디</label>
                    <div className={styles.inputWithButton}>
                        <input
                            type="text"
                            name="username"
                            placeholder="아이디 (4-20자 영문, 숫자)"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <button type="button" onClick={handleCheckUsername}>
                            중복 확인
                        </button>
                    </div>
                    {validationState.isUsernameAvailable === true &&
                        <p className={styles.successText}>사용 가능한 아이디입니다.</p>}
                    {validationState.isUsernameAvailable === false &&
                        <p className={styles.errorText}>사용 불가능한 아이디입니다.</p>}
                </div>

                {/* 비밀번호 입력 */}
                <div className={styles.inputGroup}>
                    <label>비밀번호</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8-20자)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {formData.password && !patterns.password.test(formData.password) &&
                        <p className={styles.errorText}>비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.</p>}
                </div>

                {/* 비밀번호 확인 */}
                <div className={styles.inputGroup}>
                    <label>비밀번호 확인</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="비밀번호 재입력"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {validationState.passwordMatch === true &&
                        <p className={styles.successText}>비밀번호가 일치합니다.</p>}
                    {validationState.passwordMatch === false &&
                        <p className={styles.errorText}>비밀번호가 일치하지 않습니다.</p>}
                </div>

                {/* 닉네임 입력 */}
                <div className={styles.inputGroup}>
                    <label>닉네임</label>
                    <div className={styles.inputWithButton}>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임 (2-10자 영문, 숫자, 한글)"
                            value={formData.nickname}
                            onChange={handleChange}
                            required
                        />
                        <button type="button" onClick={handleCheckNickname}>
                            중복 확인
                        </button>
                    </div>
                    {validationState.isNicknameAvailable === true &&
                        <p className={styles.successText}>사용 가능한 닉네임입니다.</p>}
                    {validationState.isNicknameAvailable === false &&
                        <p className={styles.errorText}>사용 불가능한 닉네임입니다.</p>}
                </div>

                {/* 이메일 입력 */}
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
                        />
                        <span>@</span>
                        <select
                            name="emailDomain"
                            value={formData.emailDomain}
                            onChange={handleChange}
                        >
                            <option value="gmail.com">gmail.com</option>
                            <option value="naver.com">naver.com</option>
                            <option value="daum.net">daum.net</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleEmailVerification}
                            disabled={isLoading}
                        >
                            {isLoading ? '발송 중...' : '인증번호 받기'}
                        </button>
                    </div>
                    {messages.emailSent && <p>{messages.emailSent}</p>}
                </div>

                {/* 인증번호 입력 */}
                <div className={styles.inputGroup}>
                    <label>인증번호</label>
                    <div className={styles.inputWithButton}>
                        <input
                            type="text"
                            name="verificationCode"
                            placeholder="인증번호 6자리"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={handleVerification}
                            disabled={isLoading}
                        >
                            {isLoading ? '확인 중...' : '인증확인'}
                        </button>
                    </div>
                    {messages.verification}
                </div>

                {validationState.verificationError &&
                    <p className={styles.errorText}>입력한 정보를 다시 확인해주세요.</p>}

                <div className={styles.buttons}>
                    <button type="button" onClick={handleCancel}>
                        취소
                    </button>
                    <button type="submit">
                        회원가입
                    </button>
                </div>
            </form>
        </div>
    );
}