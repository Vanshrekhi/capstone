import { useState } from 'react';

export default function PreviewPanel({ previewUrl }) {
  const [key, setKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const refresh = () => {
    setSpinning(true);
    setKey(k => k + 1);
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 h-9 bg-[#0f0f1a] border-b border-[#1e1e35] flex-shrink-0">

        {/* Label */}
        <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] font-semibold text-[#555580] uppercase tracking-widest">
          <div className="w-4 h-4 bg-blue-950/60 border border-blue-700/30 rounded flex items-center justify-center text-blue-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          Live Preview
        </div>

        {/* URL bar + controls */}
        <div className="flex items-center gap-1.5 flex-1 overflow-hidden min-w-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-[#1a1a2e] border border-[#252540] rounded px-2 py-0.5">
            <svg width="10" height="10" className="flex-shrink-0 text-[#555580]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="font-mono text-[11px] text-[#9090bb] truncate">
              {previewUrl || 'Waiting for sandbox...'}
            </span>
          </div>
          <button
            id="preview-refresh-btn"
            onClick={refresh}
            title="Refresh"
            className="w-6 h-6 flex items-center justify-center bg-[#1a1a2e] border border-[#252540] rounded text-[#9090bb] hover:text-[#e8e8ff] hover:border-[#30305a] transition-all duration-150"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={spinning ? 'animate-spin' : ''}>
              <polyline points="23,4 23,10 17,10" /><polyline points="1,20 1,14 7,14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <a
            id="preview-open-tab-btn"
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new tab"
            className="w-6 h-6 flex items-center justify-center bg-[#1a1a2e] border border-[#252540] rounded text-[#9090bb] hover:text-[#e8e8ff] hover:border-[#30305a] transition-all duration-150 no-underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>

      {/* iframe / placeholder */}
      <div className="flex-1 overflow-hidden bg-white">
        {previewUrl ? (
          <iframe
            key={key}
            id="preview-iframe"
            src={previewUrl}
            title="Sandbox Preview"
            className="w-full h-full border-none block"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
          />
        ) : (
          <div className="w-full h-full bg-[#13131f] flex flex-col items-center justify-center gap-3 text-[#555580] text-[13px]">
            <div className="text-[32px] opacity-40">🚀</div>
            <p>Preview will appear here after sandbox starts</p>
          </div>
        )}
      </div>
    </div>
  );
}
