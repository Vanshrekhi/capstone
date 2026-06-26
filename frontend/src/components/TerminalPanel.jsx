import { useEffect, useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';

export default function TerminalPanel({ sandboxId }) {
  const containerRef = useRef(null);
  const { fitTerminal } = useTerminal(containerRef, sandboxId);

  useEffect(() => {
    const obs = new ResizeObserver(() => fitTerminal());
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [fitTerminal]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0f]">

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 h-9 bg-[#0f0f1a] border-b border-[#1e1e35] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* macOS-style traffic dots */}
          <div className="flex items-center gap-[5px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#555580] uppercase tracking-widest">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4,17 10,11 4,5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Terminal
          </div>
        </div>
        <span className="font-mono text-[11px] text-[#555580] bg-[#1a1a2e] border border-[#1e1e35] px-2 py-0.5 rounded">
          {sandboxId?.slice(0, 8)}...
        </span>
      </div>

      {/* xterm container */}
      <div ref={containerRef} id="terminal-container" className="flex-1 overflow-hidden p-1.5" />
    </div>
  );
}
