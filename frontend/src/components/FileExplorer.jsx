import { useState, useEffect } from 'react';

const EXT_ICONS = {
  jsx: '⚛', tsx: '⚛', js: '🟡', ts: '🔷',
  css: '🎨', html: '🌐', json: '📋',
  md: '📝', svg: '🖼', png: '🖼', jpg: '🖼',
  gitignore: '🔒', dockerfile: '🐳',
};

function FileIcon({ name }) {
  const ext = name.split('.').pop()?.toLowerCase();
  return <span className="text-[13px] leading-none flex-shrink-0">{EXT_ICONS[ext] || '📄'}</span>;
}

function TreeNode({ node, depth, onSelect, selected }) {
  const [open, setOpen] = useState(depth === 0);
  const entries = Object.entries(node);
  if (!entries.length) return null;

  return (
    <ul className="list-none" style={{ paddingLeft: depth * 12 + 'px' }}>
      {entries.map(([name, val]) => {
        if (val.__file) {
          const active = selected === val.path;
          return (
            <li key={name}
              onClick={() => onSelect(val.path)}
              className={`
                flex items-center gap-1.5 px-3.5 py-[3px] text-[12.5px] cursor-pointer transition-all duration-100 whitespace-nowrap
                border-r-2 select-none
                ${active
                  ? 'bg-violet-900/20 text-violet-300 border-violet-600'
                  : 'text-[#9090bb] border-transparent hover:bg-[#1e1e35] hover:text-[#e8e8ff]'}
              `}>
              <FileIcon name={name} />
              <span className="truncate">{name}</span>
            </li>
          );
        }
        return (
          <li key={name}>
            <div
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 px-3.5 py-[3px] text-[12.5px] text-[#9090bb] cursor-pointer font-medium hover:bg-[#1e1e35] hover:text-[#e8e8ff] transition-all duration-100 select-none whitespace-nowrap"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '150ms', flexShrink: 0 }}>
                <polyline points="9,18 15,12 9,6" />
              </svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-amber-400/70">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="truncate">{name}</span>
            </div>
            {open && <TreeNode node={val} depth={depth + 1} onSelect={onSelect} selected={selected} />}
          </li>
        );
      })}
    </ul>
  );
}

export default function FileExplorer({ sandbox, onFileSelect, selectedFile }) {
  const [tree, setTree] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchFiles = () => {
    if (!sandbox) return;
    setLoading(true);
    fetch(`${sandbox.agentBase}/list-files`)
      .then(r => r.json())
      .then(d => {
        const list = d.files || [];
        const t = {};
        list.forEach(f => {
          const parts = f.split('/');
          let node = t;
          parts.forEach((p, i) => {
            if (i === parts.length - 1) { node[p] = { __file: true, path: f }; }
            else { node[p] = node[p] || {}; node = node[p]; }
          });
        });
        setTree(t);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFiles();
  }, [sandbox]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-[#1e1e35] flex-shrink-0 text-[11px] font-semibold text-[#555580] uppercase tracking-widest">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span className="flex-1">Explorer</span>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className={`p-1 rounded text-[#9090bb] hover:text-[#e8e8ff] hover:bg-[#1e1e35] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Refresh files"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.08 5.08" />
          </svg>
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1.5">
        <TreeNode node={tree} depth={0} onSelect={onFileSelect} selected={selectedFile} />
      </div>
    </div>
  );
}
