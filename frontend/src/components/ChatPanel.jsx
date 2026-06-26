import { useState, useRef, useEffect } from 'react';

/* ── Simple inline markdown renderer ── */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function MarkdownText({ text }) {
  const html = text
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
      `<pre class="my-2 px-3 py-2.5 bg-[#0a0a0f] border border-[#252540] rounded-lg overflow-x-auto font-mono text-[12px] leading-[1.5] text-[#e8e8ff]"><code>${escapeHtml(code.trim())}</code></pre>`)
    .replace(/`([^`]+)`/g,
      '<code class="px-1 py-0.5 bg-violet-950/50 border border-violet-700/30 rounded text-[11px] font-mono text-violet-300">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`animate-msg-in flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? 'bg-gradient-to-br from-violet-600 to-blue-600' : 'bg-gradient-to-br from-emerald-800 to-teal-700'} text-white`}>
        {isUser ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2z" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`
        max-w-[calc(100%-52px)] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
        ${isUser
          ? 'bg-violet-900/30 border border-violet-700/30 text-[#e8e8ff] rounded-tr-sm'
          : 'bg-[#1a1a2e] border border-[#252540] text-[#e8e8ff] rounded-tl-sm'}
      `}>
        {msg.content
          ? <MarkdownText text={msg.content} />
          : msg.isStreaming
            ? <div className="flex gap-1 py-1 items-center">
                <span className="typing-dot typing-dot-1" />
                <span className="typing-dot typing-dot-2" />
                <span className="typing-dot typing-dot-3" />
              </div>
            : null}
        {msg.isStreaming && msg.content && (
          <span className="animate-blink text-violet-400 ml-0.5">▋</span>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ sandboxId, messages, isStreaming, onSend, onStop }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(text);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    'Create a todo app with dark theme',
    'Build a weather dashboard UI',
    'Make a Pokémon card viewer',
    'Create a music player interface',
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e35] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] bg-gradient-to-br from-violet-600 to-blue-600 rounded-md flex items-center justify-center text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-[#9090bb] uppercase tracking-widest">AI Assistant</span>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="animate-badge w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
            Generating...
          </div>
        )}
      </div>

      {/* Messages */}
      <div id="chat-messages" className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <div className="text-[38px] animate-float-bob">🤖</div>
            <p className="text-[13px] text-[#555580] leading-relaxed">
              Describe what you want to build and I'll generate it for you.
            </p>
            <div className="flex flex-col gap-1.5 w-full mt-1">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => onSend(s)}
                  className="w-full px-3.5 py-2 bg-[#1a1a2e] border border-[#252540] rounded-xl text-[12px] text-[#9090bb] text-left transition-all duration-150 hover:bg-[#1e1e35] hover:border-violet-700/50 hover:text-[#e8e8ff] hover:translate-x-1">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1e1e35] px-3 py-3 flex-shrink-0 bg-[#0f0f1a]">
        <div className="flex gap-2 items-end bg-[#1a1a2e] border border-[#252540] rounded-xl px-3 py-2 focus-within:border-violet-600/60 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all duration-150">
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="flex-1 bg-transparent border-none outline-none text-[#e8e8ff] text-[13px] resize-none leading-relaxed placeholder-[#555580] min-h-[22px] max-h-[160px] px-1"
            placeholder="Describe what you want to build..."
            value={input}
            rows={1}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
            onKeyDown={handleKey}
          />
          <button
            id="chat-send-btn"
            onClick={isStreaming ? onStop : handleSend}
            disabled={!isStreaming && !input.trim()}
            className={`
              w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-white transition-all duration-150
              ${isStreaming
                ? 'bg-red-600 shadow-[0_0_12px_rgba(239,68,68,0.3)] hover:bg-red-500'
                : input.trim()
                  ? 'bg-violet-700 shadow-[0_0_12px_rgba(124,58,237,0.3)] hover:bg-violet-600 hover:scale-105'
                  : 'bg-[#252540] text-[#555580] cursor-not-allowed'}
            `}
          >
            {isStreaming ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22,2 15,22 11,13 2,9" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#555580] text-right mt-1.5">⏎ Send · Shift+⏎ New line</p>
      </div>
    </div>
  );
}
