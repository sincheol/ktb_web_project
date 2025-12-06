import { useState } from 'react';
import axios from 'axios';

// 백엔드 주소 (반복되니 상수로 관리)
const API_URL = "http://127.0.0.1:8000";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true); // 로그인 vs 회원가입 토글
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // API 엔드포인트 결정
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    
    try {
      // withCredentials: true -> 쿠키(세션)를 주고받기 위해 필수!
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        withCredentials: true 
      });

      if (isLogin) {
        alert("로그인 성공!");
        onLogin(); // App.jsx에 로그인 상태 알림
      } else {
        alert("회원가입 성공! 로그인해주세요.");
        setIsLogin(true); // 로그인 화면으로 전환
      }
    } catch (err) {
      setError(err.response?.data?.detail || "오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isLogin ? "로그인" : "회원가입"}
        </h2>
        
        {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" name="email" placeholder="이메일" required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          <input
            type="password" name="password" placeholder="비밀번호" required
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
          {!isLogin && (
            <input
              type="text" name="nickname" placeholder="닉네임" required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          )}
          
          <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            {isLogin ? "로그인하기" : "가입하기"}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-500 hover:underline"
          >
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}