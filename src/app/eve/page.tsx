'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, Camera, Monitor, Send, Settings, PanelLeftClose, 
  PanelLeftOpen, LayoutDashboard, Expand, List, X, Eye
} from 'lucide-react';
import './eve.css';

// ── TYPES ──
type OrbState = 'standby' | 'listening' | 'speaking';

export default function EveCockpit() {
  // States
  const [orbState, setOrbState] = useState<OrbState>('standby');
  const [response, setResponse] = useState('Clique no orbe para ativar, Rafa.');
  const [userInput, setUserInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Refs
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const starfieldRef = useRef<HTMLCanvasElement | null>(null);
  const isMicRef = useRef(false);

  // ── INITIALIZATION ──
  useEffect(() => {
    initStarfield();
    // Setup Audio
    audioRef.current = new Audio();
    
    // Setup Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onend = () => {
          if (isMicRef.current) {
            try { recognitionRef.current.start(); } catch(e) {}
          }
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setResponse('⚠️ Permissão de microfone negada. Verifique as configurações do navegador.');
        } else if (event.error === 'no-speech') {
          // Normal, just restart or ignore
        } else {
          setResponse(`Erro no áudio: ${event.error}`);
        }
      };
    }

    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    };
  }, []);

  // ── STARFIELD ──
  const initStarfield = () => {
    const canvas = starfieldRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      speed: Math.random() * 0.5 + 0.1
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
      });
      requestAnimationFrame(animate);
    };
    animate();
  };

  // ── SPEECH LOGIC ──
  const handleSpeechResult = (event: any) => {
    if (orbState === 'speaking') {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (/\bev\b|para\b|silêncio\b|chega\b/i.test(transcript)) {
            stopSpeaking();
            setResponse('Entendido, parei.');
            return;
        }
    }

    if (orbState === 'standby' || orbState === 'listening') {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (event.results[event.results.length - 1].isFinal) {
            if (transcript.includes('eve') || transcript.includes('ev')) {
                const command = transcript.split(/eve|ev/i).pop()?.trim();
                if (command) processCommand(command);
            }
        }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setOrbState('standby');
  };

  const toggleMonitoring = async () => {
    if (isMonitoring) {
        setIsMonitoring(false);
        if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
        setResponse('Modo observação desativado.');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsMonitoring(true);
        setResponse('EVE está te acompanhando agora, Rafa.');

        monitorIntervalRef.current = setInterval(async () => {
            if (orbState !== 'standby') return;

            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.6);

            const res = await fetch('/api/eve/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: "Analise minha tela em silêncio. Se houver algo importante, comente. Se não, responda 'nothing'.",
                    persona: 'EVE Proativa. Seja curta e estratégica. Se não houver nada útil, diga: nothing.' 
                })
            });
            const data = await res.json();
            if (data.response && !data.response.toLowerCase().includes('nothing')) {
                speak(data.response);
            }
        }, 60000); // 1 minuto entre capturas proativas

        stream.getVideoTracks()[0].onended = () => {
            setIsMonitoring(false);
            if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
        };

    } catch (err) {
        setResponse('Não consegui ativar a observação proativa.');
    }
  };

  const toggleMic = () => {
    if (isMicActive) {
      isMicRef.current = false;
      recognitionRef.current?.stop();
      setIsMicActive(false);
      setOrbState('standby');
    } else {
      isMicRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsMicActive(true);
        setOrbState('listening');
        setResponse('Estou ouvindo...');
      } catch (e) {
        console.error('Start error:', e);
      }
    }
  };

  // ── COMMAND PROCESSING ──
  const processCommand = async (text: string) => {
    if (!text) return;
    setOrbState('listening');
    setResponse('Processando...');

    try {
      const res = await fetch('/api/eve/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: text, 
            history,
            persona: 'Você é a EVE, consultora estratégica do Rafa. Personalidade feminina, direta e eficiente.'
        })
      });
      const data = await res.json();
      if (data.response) {
        speak(data.response);
        setHistory(prev => [...prev, { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: data.response }] }]);
      }
    } catch (err) {
      setResponse('Houve um erro na Matrix, Rafa.');
      setOrbState('standby');
    }
  };

  const speak = async (text: string) => {
    setResponse(text);
    setOrbState('speaking');
    try {
      const res = await fetch('/api/eve/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('TTS Error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setOrbState('standby');
      }
    } catch (err) {
      setOrbState('standby');
    }
  };

  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');

      stream.getTracks().forEach(t => t.stop());

      setResponse('Analisando tela...');
      const res = await fetch('/api/eve/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            imageBase64: base64, 
            question: 'O que está na minha tela agora? Dê um insight estratégico.',
            persona: 'EVE consultora estratégica.'
        })
      });
      const data = await res.json();
      speak(data.response);
    } catch (err) {
      setResponse('Não consegui ver sua tela.');
    }
  };

  return (
    <div className="eve-container">
      <canvas id="starfield" ref={starfieldRef} />

      <div className="app-shell">
        {/* SIDEBAR */}
        <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
          <div className="ev-logo">
            <div className="logo-dot" />
            <span className="logo-text">EVE</span>
          </div>
          
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <button className="tool-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '0 10px', color: '#fff' }}>
                <LayoutDashboard size={18} /> <span style={{ marginLeft: '10px' }}>Dashboard</span>
             </button>
             <button className="tool-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '0 10px' }}>
                <Settings size={18} /> <span style={{ marginLeft: '10px' }}>Ajustes</span>
             </button>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <header className="top-bar">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="icon-btn" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
             </button>
             <div className="system-status">
               <div className="pulse-dot" />
               <span className="status-text">EVE CORE ACTIVE</span>
             </div>
             <div className="status-text">{new Date().toLocaleTimeString()}</div>
          </header>

          <div className="interaction-zone">
             <div className={`orb-container`} onClick={toggleMic}>
                <div className={`orb-inner ${orbState}`} />
             </div>

             <div className="response-container">
                <p id="ev-response">{response}</p>
             </div>
          </div>

          <footer className="bottom-toolbar">
             <div className="toolbar-pill">
                <button className={`tool-btn ${isMicActive ? 'active' : ''}`} onClick={toggleMic}>
                  <Mic size={20} />
                </button>
                <div className="input-area">
                  <input 
                    type="text" 
                    placeholder="Escreva um comando..." 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (processCommand(userInput), setUserInput(''))}
                  />
                </div>
                <button className="tool-btn" onClick={captureScreen}>
                  <Monitor size={20} />
                </button>
                <button className="tool-btn" onClick={() => setIsMonitoring(!isMonitoring)}>
                  <Eye size={20} color={isMonitoring ? '#00f2ff' : undefined} />
                </button>
                <button className="tool-btn send-btn" onClick={() => (processCommand(userInput), setUserInput(''))}>
                  <Send size={20} />
                </button>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
