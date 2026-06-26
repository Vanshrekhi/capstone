import { useState, useEffect, useRef, useCallback } from 'react';


export function useChat(sandboxId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!sandboxId || isStreaming) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`/api/ai/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId: sandboxId }),
        signal: controller.signal,
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accum = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.trim());

        for (const line of lines) {
          // Try to parse SSE data
          const dataLine = line.startsWith('data:') ? line.slice(5).trim() : line.trim();
          try {
            const parsed = JSON.parse(dataLine);
            // Extract the last message content from SSE stream
            const msgs = parsed.messages;
            if (msgs && msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              const content = lastMsg?.kwargs?.content;
              if (content && typeof content === 'string') {
                accum = content;
              } else if (Array.isArray(content)) {
                accum = content.map(c => (typeof c === 'string' ? c : c?.text || '')).join('');
              }
              setMessages(prev =>
                prev.map(m => m.id === assistantMsg.id ? { ...m, content: accum } : m)
              );
            }
          } catch {
            // Not JSON, treat as plain text chunk
            if (dataLine && dataLine !== '[DONE]') {
              accum += dataLine;
              setMessages(prev =>
                prev.map(m => m.id === assistantMsg.id ? { ...m, content: accum } : m)
              );
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === Date.now() + 1 ? { ...m, content: `Error: ${err.message}`, isError: true } : m
          )
        );
      }
    } finally {
      setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
      setIsStreaming(false);
    }
  }, [sandboxId, isStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m));
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming };
}
