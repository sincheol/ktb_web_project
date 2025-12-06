import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Layout, LogOut, Pencil, User, Send, Bot } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

// --- Auth Component (로그인/회원가입) ---
function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? "/auth/login" : "/auth/signup";
    
    try {
      await axios.post(`${API_URL}${endpoint}`, formData, {
        withCredentials: true 
      });

      if (isLogin) {
        alert("로그인 성공!");
        onLogin();
      } else {
        alert("회원가입 성공! 로그인해주세요.");
        setIsLogin(true);
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

// --- Board Component (게시판) ---
function Board() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/`, { withCredentials: true });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("게시글 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    try {
      await axios.post(`${API_URL}/posts/`, newPost, { withCredentials: true });
      alert("게시글 작성 완료!");
      setIsModalOpen(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (err) {
      alert("작성 실패: " + (err.response?.data?.detail || "알 수 없는 오류"));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📌 커뮤니티 게시판</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <Pencil className="w-4 h-4 mr-2"/> 글쓰기
        </button>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.post_id} className="bg-white p-5 rounded-lg shadow border hover:shadow-md transition">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
            <div className="flex justify-between text-sm text-gray-400 border-t pt-3">
              <span className="flex items-center"><User className="w-3 h-3 mr-1"/> {post.author_name}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">새 글 작성</h2>
            <input 
              className="w-full border p-2 rounded" 
              placeholder="제목"
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              className="w-full border p-2 rounded h-32" 
              placeholder="내용을 입력하세요..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">취소</button>
              <button onClick={handleCreatePost} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">작성하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Chat Component (AI 채팅) ---
function Chat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: '안녕하세요! 무엇이든 물어보세요. (RAG 동작 중)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          const updatedMsg = { ...lastMsg, content: lastMsg.content + chunk };
          return [...prev.slice(0, -1), updatedMsg];
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: '에러가 발생했습니다.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-3xl mx-auto border rounded-lg bg-gray-50 shadow-sm mt-4">
      <div className="p-4 border-b bg-white rounded-t-lg font-bold flex items-center">
        <Bot className="w-6 h-6 mr-2 text-blue-600"/> AI Assistant (Gemma 3)
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg flex items-start gap-2 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              {msg.role === 'assistant' && <Bot className="w-5 h-5 mt-1 opacity-70"/>}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              {msg.role === 'user' && <User className="w-5 h-5 mt-1 opacity-70"/>}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].role === 'user' && (
          <div className="text-gray-400 text-sm ml-2 animate-pulse">답변 생성 중...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t rounded-b-lg flex gap-2">
        <input
          className="flex-1 border p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          <Send className="w-5 h-5"/>
        </button>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await axios.get(`${API_URL}/auth/status`, { withCredentials: true });
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.delete(`${API_URL}/auth/logout`, { withCredentials: true });
      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패", error);
    }
  };

  if (loading) return <div className="text-center mt-20">로딩 중...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {!isLoggedIn ? (
          <Auth onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <>
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h1 className="text-xl font-bold text-blue-600">🚀 My AI Community</h1>
              <div className="flex gap-6 items-center">
                <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 font-medium">
                  <Layout className="w-5 h-5 mr-1"/> 게시판
                </Link>
                <Link to="/chat" className="flex items-center text-gray-600 hover:text-blue-600 font-medium">
                  <MessageSquare className="w-5 h-5 mr-1"/> AI 채팅
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center text-red-500 hover:text-red-700 font-medium border px-3 py-1 rounded hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1"/> 로그아웃
                </button>
              </div>
            </nav>

            <div className="container mx-auto p-4">
              <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;