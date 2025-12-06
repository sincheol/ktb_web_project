import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, User } from 'lucide-react'; // 아이콘

const API_URL = "http://127.0.0.1:8000";

export default function Board() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/`, { withCredentials: true });
      // 백엔드가 { "posts": [...] } 형태로 준다고 가정
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("게시글 로딩 실패:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 글쓰기 처리
  const handleCreatePost = async () => {
    try {
      await axios.post(`${API_URL}/posts/`, newPost, { withCredentials: true });
      alert("게시글 작성 완료!");
      setIsModalOpen(false);
      setNewPost({ title: '', content: '' });
      fetchPosts(); // 목록 새로고침
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

      {/* 게시글 목록 */}
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

      {/* 글쓰기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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