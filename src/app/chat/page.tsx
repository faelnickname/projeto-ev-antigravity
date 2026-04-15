"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, ShieldCheck, Volume2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'nexo';
  text: string;
  audio?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'nexo', text: 'Olá, Rafa! Sou o NEXO, sua inteligência financeira de elite. Como posso elevar sua performance hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          sendAudioMessage(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendAudioMessage = async (base64Audio: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: '🎤 Mensagem de voz enviada...' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });
      const data = await res.json();
      
      if (data.resposta) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexo', text: data.resposta, audio: data.audio }]);
        if (data.audio) playAudio(data.audio);
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexo', text: 'Tive um erro ao processar seu áudio. Poderia repetir?' }]);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = (base64?: string) => {
    if (!base64) return;
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.play();
    } catch (err) {
      console.error("Erro ao reproduzir áudio:", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: userMessage })
      });
      const data = await res.json();
      
      if (data.resposta) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexo', text: data.resposta, audio: data.audio }]);
        if (data.audio) {
          playAudio(data.audio);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'nexo', text: 'Tive um erro de sincronização. Poderia repetir?' }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="chat-container-elite">
      <header className="page-header chat-header-mobile" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title header-title-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="header-icon-mobile" style={{ padding: '0.5rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '10px', color: 'var(--primary)' }}>
              <Sparkles size={24} />
            </div>
            Canal de Interação
          </h2>
          <p className="page-subtitle header-subtitle-mobile">Conversas criptografadas com sua IA Financeira.</p>
        </div>
        <div className="session-badge-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
          <ShieldCheck size={16} />
          <span>Sessão Segura</span>
        </div>
      </header>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'radial-gradient(circle at center, rgba(0, 210, 255, 0.02), transparent)' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ 
              display: 'flex', 
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '1.2rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                width: 42, height: 42, borderRadius: '14px', 
                background: msg.role === 'user' ? 'var(--card-border)' : 'linear-gradient(135deg, var(--primary), #0078ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: msg.role === 'nexo' ? '0 8px 16px var(--primary-glow)' : 'none',
                color: '#fff'
              }}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div style={{ 
                maxWidth: '70%',
                padding: '1.2rem 1.5rem',
                borderRadius: '20px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
                borderBottomLeftRadius: msg.role === 'nexo' ? '4px' : '20px',
                background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-color)',
                border: msg.role === 'nexo' ? '1px solid var(--card-border)' : 'none',
                boxShadow: msg.role === 'user' ? '0 10px 20px var(--primary-glow)' : 'none',
                position: 'relative'
              }}>
                {msg.role === 'nexo' && msg.audio && (
                  <button 
                    onClick={() => playAudio(msg.audio)}
                    style={{ position: 'absolute', right: '10px', top: '10px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', opacity: 0.6 }}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
                <p style={{ lineHeight: 1.6, fontSize: '1rem', fontWeight: 500 }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
              <div style={{ width: 42, height: 42, borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Bot size={20} />
              </div>
              <div style={{ padding: '1.2rem 1.5rem', borderRadius: '20px', borderBottomLeftRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)' }}>
                <div className="typing-dots">
                   <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              style={{ 
                background: isRecording ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
                color: isRecording ? '#fff' : 'var(--primary)',
                border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s',
                animation: isRecording ? 'pulse-red 1s infinite' : 'none'
              }}
            >
              {isRecording ? <div style={{ width: 12, height: 12, background: '#fff', borderRadius: '2px' }} /> : <Volume2 size={24} />}
            </button>

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Mensagem para NEXO..."
                  style={{ 
                    width: '100%', padding: '1.1rem 1.5rem', borderRadius: '16px', 
                    border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--text-color)', outline: 'none', fontSize: '1rem'
                  }}
                  className="chat-input"
                />
              </div>
              <button type="submit" disabled={loading} style={{ 
                width: '50px', height: '50px', borderRadius: '16px', background: 'var(--primary)', color: '#fff', 
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading ? 0.7 : 1
              }}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .chat-input:focus {
          border-color: var(--primary) !important;
          background: rgba(255,255,255,0.08) !important;
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.1);
        }
        .send-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--primary-glow);
        }
        .typing-dots { display: flex; gap: 4px; }
        .typing-dots span { width: 6px; height: 6px; background: #64748b; borderRadius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

