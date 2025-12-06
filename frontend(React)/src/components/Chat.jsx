import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: '안녕하세요! 무엇이든 물어보세요. (최신 글 5개 기준)' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 1. 사용자 메시지 추가
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. 스트리밍 요청 (fetch 사용)
      const response = await fetch(`${API_URL}/chat/rag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }) // 사용자가 입력한 메시지 전송
      });

      // 3. 스트리밍 데이터 읽기
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // AI 메시지 빈 껍데기 추가
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // 마지막 메시지(AI)에 글자 이어붙이기
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
      {/* 채팅창 헤더 */}
      <div className="p-4 border-b bg-white rounded-t-lg font-bold flex items-center">
        <Bot className="w-6 h-6 mr-2 text-blue-600"/> AI Assistant (Gemma 3)
      </div>

      {/* 메시지 목록 */}
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

      {/* 입력창 */}
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