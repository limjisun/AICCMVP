import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import loginLogo from '../assets/images/login-logo.png';
import iconId from '../assets/images/icon-id.png';
import iconPw from '../assets/images/icon-pw.png';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 로그인 로직 (나중에 API 연결)
    // 임시: 특정 ID/PW만 로그인 성공
    if (userId === 'admin' && password === 'admin') {
      setError('');
      navigate('/');
    } else if (!userId || !password) {
      setError('아이디와 비밀번호를 입력해 주세요');
    } else {
      setError('알 수 없는 계정입니다. 아이디를 확인해 주세요');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <img src={loginLogo} alt="UBASE" className="login-logo" />
            <p className="login-subtitle">ACC ADMIN</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-input-group-wrap">
              <div className="login-input-group">
                <div className="login-input-icon">
                  <img src={iconId} alt="ID" />
                </div>
                <input
                  type="text"
                  className="login-input"
                  placeholder="아이디를 입력하세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="login-input-group">
                <div className="login-input-icon">
                  <img src={iconPw} alt="Password" />
                </div>
                <input
                  type="password"
                  className="login-input"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="login-error">{error}</p>}
            </div>
            <button type="submit" className="login-button">
              로그인
            </button>
          </form>
        </div>
        <div className="login-footer">
            <p>© 2023 UBASE. All rights reserved.</p>
          </div>
      </div>
    </div>
  );
};

export default Login;
