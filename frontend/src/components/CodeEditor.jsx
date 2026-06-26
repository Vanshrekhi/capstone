import { useState, useEffect } from 'react';

export default function CodeEditor({ sandbox, filePath }) {
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!sandbox || !filePath) return;
    setLoading(true);
    fetch(`${sandbox.agentBase}/read-files?files=${encodeURIComponent(filePath)}`)
      .then(r => r.json())
      .then(d => {
        const fileObj = d.files?.[0];
        if (!fileObj) return;
        const key = Object.keys(fileObj)[0];
        setContent(fileObj[key]);
        setOriginal(fileObj[key]);
      })
      .catch(() => setContent('// Error loading file'))
      .finally(() => setLoading(false));
  }, [sandbox, filePath]);

  const handleSave = async () => {
    if (!sandbox || !filePath || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`${sandbox.agentBase}/update-files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ path: filePath, content }] }),
      });
      if (res.ok) {
        setOriginal(content);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const isDirty = content !== original;
  const lineCount = content.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-[#13131f] overflow-hidden">

      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 h-9 bg-[#0f0f1a] border-b border-[#1e1e35] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="12" height="12" className="text-[#555580] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" />
          </svg>
          <span className="font-mono text-[12px] text-[#e8e8ff] truncate">
            {filePath || 'No file selected'}
          </span>
          {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {savedFlash && (
            <span className="text-[11px] text-emerald-400 font-medium animate-fade-up">✓ Saved</span>
          )}
          <button
            id="save-file-btn"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-medium border transition-all duration-150
              ${isDirty && !saving
                ? 'text-violet-300 border-violet-700/50 bg-violet-900/20 hover:bg-violet-900/40 cursor-pointer'
                : 'text-[#555580] border-[#252540] bg-[#1a1a2e] cursor-not-allowed opacity-50'}
            `}
          >
            {saving ? (
              <><span className="w-3 h-3 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />Saving...</>
            ) : (
              <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" />
              </svg>Save</>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-2.5 text-[#555580] text-[13px]">
          <span className="w-4 h-4 border-2 border-[#555580]/30 border-t-[#555580] rounded-full animate-spin" />
          Loading file...
        </div>
      ) : filePath ? (
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Line numbers */}
          <div className="w-12 bg-[#0f0f1a] border-r border-[#1e1e35] overflow-hidden py-3.5 flex-shrink-0 select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="h-[19.5px] flex items-center justify-end pr-2.5 font-mono text-[11px] text-[#555580] leading-none">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Textarea */}
          <textarea
            id="code-editor-textarea"
            className="flex-1 bg-transparent border-none outline-none text-[#e8e8ff] font-mono text-[13px] leading-[1.5] px-4 py-3.5 resize-none overflow-auto whitespace-pre tab-[2] caret-violet-400 selection:bg-violet-700/30"
            value={content}
            spellCheck={false}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                const end = e.target.selectionEnd;
                setContent(v => v.slice(0, s) + '  ' + v.slice(end));
                requestAnimationFrame(() => {
                  e.target.selectionStart = e.target.selectionEnd = s + 2;
                });
              }
              if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#555580] text-[13px]">
          <div className="text-[34px] opacity-40">📂</div>
          <p>Select a file from the explorer to start editing</p>
        </div>
      )}
    </div>
  );
}
