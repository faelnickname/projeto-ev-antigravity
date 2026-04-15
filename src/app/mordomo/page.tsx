'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './mordomo.module.css';

type Estado = 'aguardando' | 'escutando' | 'processando' | 'respondendo';

interface Mensagem {
  tipo: 'usuario' | 'mordomo';
  texto: string;
  hora: string;
}

export default function MordomoPage() {
  const [estado, setEstado] = useState<Estado>('aguardando');
  const [transcricao, setTranscricao] = useState('');
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { tipo: 'mordomo', texto: 'Olá, Rafael. Diga "NEXO" para me ativar.', hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [nivelAudio, setNivelAudio] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const addMensagem = useCallback((tipo: 'usuario' | 'mordomo', texto: string) => {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMensagens(prev => [...prev.slice(-20), { tipo, texto, hora }]);
  }, []);

  const playAudio = useCallback((audioDataUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      const audio = new Audio(audioDataUrl);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }, []);

  const enviarAudio = useCallback(async (audioBlob: Blob) => {
    setEstado('processando');
    setTranscricao('Processando...');

    try {
      const form = new FormData();
      form.append('audio', audioBlob, 'audio.webm');

      const res = await fetch('/api/mordomo', { method: 'POST', body: form });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setTranscricao(data.transcricao || '');
      addMensagem('usuario', data.transcricao || '');
      addMensagem('mordomo', data.resposta);

      setEstado('respondendo');
      if (data.audio) {
        await playAudio(data.audio);
      }

    } catch (err: any) {
      addMensagem('mordomo', 'Desculpe, não consegui processar. Tente novamente.');
    } finally {
      setEstado('aguardando');
      setTranscricao('');
    }
  }, [addMensagem, playAudio]);

  const pararGravacao = useCallback(() => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    cancelAnimationFrame(animFrameRef.current);
    setNivelAudio(0);
  }, []);

  const iniciarGravacao = useCallback(async () => {
    if (isRecordingRef.current) return;

    try {
      // Pede permissão e inicia stream de áudio
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      isRecordingRef.current = true;
      setEstado('escutando');
      setTranscricao('');
      audioChunksRef.current = [];

      // Visualização de onda
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(streamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        if (!isRecordingRef.current) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setNivelAudio(avg);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();

      // Gravação
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (blob.size > 1000) enviarAudio(blob);
        else { setEstado('aguardando'); setTranscricao(''); }
      };

      recorder.start();

      // Para automaticamente após 8 segundos de silêncio
      silenceTimerRef.current = setTimeout(() => {
        pararGravacao();
      }, 8000);

    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setEstado('aguardando');
    }
  }, [enviarAudio, pararGravacao]);

  // Wake word "EV" usando SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.toLowerCase().trim();

        // Detecta wake word "nexo"
        if (!isRecordingRef.current && (text.includes(' nexo') || text.startsWith('nexo') || text === 'nexo')) {
          recognition.stop();
          iniciarGravacao();

          // Reinicia recognition após gravação
          setTimeout(() => {
            try { recognition.start(); } catch {}
          }, 10000);
        }
      }
    };

    recognition.onend = () => {
      if (!isRecordingRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    try { recognition.start(); } catch {}

    return () => {
      try { recognition.stop(); } catch {}
    };
  }, [iniciarGravacao]);

  // Tecla Espaço = push-to-talk
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && estado === 'aguardando') {
        e.preventDefault();
        iniciarGravacao();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && estado === 'escutando') {
        e.preventDefault();
        pararGravacao();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [estado, iniciarGravacao, pararGravacao]);

  const estadoLabel = {
    aguardando: 'Diga "NEXO" ou segure Espaço',
    escutando: 'Ouvindo...',
    processando: 'Processando...',
    respondendo: 'Respondendo...'
  };

  const orbSize = 80 + (nivelAudio * 1.5);

  return (
    <div className={styles.container}>
      {/* Painel esquerdo — Conversa */}
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <span className={styles.dot} data-estado={estado} />
          <span>Mordomo NEXO</span>
        </div>
        <div className={styles.mensagens}>
          {mensagens.map((m, i) => (
            <div key={i} className={`${styles.mensagem} ${styles[m.tipo]}`}>
              <span className={styles.msgTexto}>{m.texto}</span>
              <span className={styles.msgHora}>{m.hora}</span>
            </div>
          ))}
        </div>
        {transcricao && (
          <div className={styles.transcricaoLive}>
            <span>🎙️ {transcricao}</span>
          </div>
        )}
      </div>

      {/* Centro — Orb principal */}
      <div className={styles.centro}>
        <div className={styles.orbContainer}>
          {/* Anéis externos pulsantes */}
          <div className={styles.anel1} data-estado={estado} />
          <div className={styles.anel2} data-estado={estado} />

          {/* Orb principal */}
          <button
            className={styles.orb}
            data-estado={estado}
            style={{ width: estado === 'escutando' ? orbSize : undefined, height: estado === 'escutando' ? orbSize : undefined }}
            onMouseDown={() => estado === 'aguardando' && iniciarGravacao()}
            onMouseUp={() => estado === 'escutando' && pararGravacao()}
          >
            {estado === 'aguardando' && '🤖'}
            {estado === 'escutando' && '🎙️'}
            {estado === 'processando' && '⚡'}
            {estado === 'respondendo' && '🔊'}
          </button>
        </div>

        <p className={styles.statusLabel}>{estadoLabel[estado]}</p>

        <div className={styles.ondasContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={styles.onda}
              data-ativo={estado === 'escutando'}
              style={{
                height: estado === 'escutando'
                  ? `${10 + Math.sin(Date.now() / 200 + i) * nivelAudio * 0.5}px`
                  : '4px',
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Painel direito — Dispositivos e agenda */}
      <div className={styles.infoPanel}>
        <div className={styles.infoSection}>
          <h3>🏠 Dispositivos</h3>
          <div className={styles.dispositivos}>
            {[
              { nome: 'Sala', icone: '💡', estado: 'desconhecido' },
              { nome: 'Quarto', icone: '💡', estado: 'desconhecido' },
              { nome: 'LED Sala', icone: '🌈', estado: 'desconhecido' },
              { nome: 'TV Samsung', icone: '📺', estado: 'desconhecido' },
              { nome: 'Computador', icone: '💻', estado: 'desconhecido' },
            ].map((d) => (
              <div key={d.nome} className={styles.dispositivo}>
                <span>{d.icone} {d.nome}</span>
                <span className={styles.dispositivoEstado}>—</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3>📅 Hoje</h3>
          <p className={styles.semDados}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
          <p className={styles.semDados}>Diga &quot;NEXO, o que tenho hoje?&quot;</p>
        </div>

        <div className={styles.infoSection}>
          <h3>📰 Notícias</h3>
          <p className={styles.semDados}>Diga &quot;NEXO, quais as notícias?&quot;</p>
        </div>
      </div>
    </div>
  );
}
