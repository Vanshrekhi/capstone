import { useState, useCallback } from 'react';


export function useSandbox() {
  const [sandbox, setSandbox] = useState(null); // { sandboxId, previewUrl, agentBase }
  const [status, setStatus] = useState('idle'); // idle | creating | ready | error
  const [error, setError] = useState(null);

  const createSandbox = useCallback(async () => {
    setStatus('creating');
    setError(null);
    try {
      const res = await fetch('/api/sandbox/start', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const agentBase = `http://${data.sandboxId}.agent.localhost`;
      setSandbox({ sandboxId: data.sandboxId, previewUrl: data.previewUrl, agentBase });
      setStatus('ready');
      return { sandboxId: data.sandboxId, previewUrl: data.previewUrl, agentBase };
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const listFiles = useCallback(async () => {
    if (!sandbox) return [];
    const res = await fetch(`${sandbox.agentBase}/list-files`);
    const data = await res.json();
    return data.files || [];
  }, [sandbox]);

  const readFile = useCallback(async (filePath) => {
    if (!sandbox) return null;
    const res = await fetch(`${sandbox.agentBase}/read-files?files=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    const fileObj = data.files?.[0];
    if (!fileObj) return null;
    const key = Object.keys(fileObj)[0];
    return fileObj[key];
  }, [sandbox]);

  const updateFile = useCallback(async (filePath, content) => {
    if (!sandbox) return false;
    const res = await fetch(`${sandbox.agentBase}/update-files`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: [{ path: filePath, content }] }),
    });
    return res.ok;
  }, [sandbox]);

  return { sandbox, status, error, createSandbox, listFiles, readFile, updateFile };
}
