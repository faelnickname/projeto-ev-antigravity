// Rate Limiting & Duplicata Detection
const messageCache = new Map<string, { text: string; timestamp: number }[]>();
const rateLimitCache = new Map<string, number[]>();

export function verificarDuplicata(numero: string, texto: string): boolean {
  const agora = Date.now();
  const cache = messageCache.get(numero) || [];
  
  // Verificar se a mesma mensagem foi enviada nos últimos 5 segundos
  const duplicata = cache.some(msg => 
    msg.text === texto && (agora - msg.timestamp) < 5000
  );

  // Adicionar nova mensagem ao cache
  cache.push({ text: texto, timestamp: agora });
  
  // Manter apenas últimas 10 mensagens
  messageCache.set(numero, cache.slice(-10));
  
  return duplicata;
}

export function verificarRateLimit(numero: string): { permitido: boolean; mensagensRestantes: number } {
  const agora = Date.now();
  const umHoraAtras = agora - 3600000;
  
  const timestamps = (rateLimitCache.get(numero) || [])
    .filter(ts => ts > umHoraAtras);
  
  const permitido = timestamps.length < 50;
  
  // Adicionar novo timestamp
  timestamps.push(agora);
  rateLimitCache.set(numero, timestamps);
  
  return {
    permitido,
    mensagensRestantes: Math.max(0, 50 - timestamps.length)
  };
}

// Limpar cache antigo a cada 1 hora
setInterval(() => {
  const agora = Date.now();
  const umHoraAtras = agora - 3600000;
  
  // Limpar messageCache
  messageCache.forEach((_, numero) => {
    const cache = messageCache.get(numero) || [];
    const filtrado = cache.filter(msg => (agora - msg.timestamp) < 300000); // 5 minutos
    if (filtrado.length === 0) {
      messageCache.delete(numero);
    } else {
      messageCache.set(numero, filtrado);
    }
  });
  
  // Limpar rateLimitCache
  rateLimitCache.forEach((_, numero) => {
    const timestamps = (rateLimitCache.get(numero) || [])
      .filter(ts => ts > umHoraAtras);
    if (timestamps.length === 0) {
      rateLimitCache.delete(numero);
    } else {
      rateLimitCache.set(numero, timestamps);
    }
  });
}, 3600000);
