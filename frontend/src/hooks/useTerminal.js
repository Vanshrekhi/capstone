import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { io } from 'socket.io-client';
import '@xterm/xterm/css/xterm.css';

export function useTerminal(containerRef, sandboxId) {
  const termRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const isInitRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !sandboxId || isInitRef.current) return;
    isInitRef.current = true;

    // Init xterm
    const term = new Terminal({
      theme: {
        background: '#0a0a0f',
        foreground: '#e8e8ff',
        cursor: '#a78bfa',
        cursorAccent: '#0a0a0f',
        black: '#1a1a2e',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a78bfa',
        cyan: '#06b6d4',
        white: '#e8e8ff',
        brightBlack: '#555580',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c4b5fd',
        brightCyan: '#22d3ee',
        brightWhite: '#f1f5f9',
      },
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 3000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect socket
    const socketUrl = `http://${sandboxId}.agent.localhost`;
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      term.writeln('\r\x1b[32m✓ Terminal connected\x1b[0m');
    });

    socket.on('disconnect', () => {
      term.writeln('\r\x1b[31m✗ Terminal disconnected\x1b[0m');
    });

    socket.on('terminal-output', (data) => {
      term.write(data);
    });

    socket.on('connect_error', (err) => {
      term.writeln(`\r\x1b[31m✗ Connection error: ${err.message}\x1b[0m`);
    });

    // Send input to server
    term.onData((data) => {
      socket.emit('terminal-input', data);
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch {}
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      socket.disconnect();
      term.dispose();
      isInitRef.current = false;
    };
  }, [sandboxId]);

  const fitTerminal = useCallback(() => {
    try { fitAddonRef.current?.fit(); } catch {}
  }, []);

  return { fitTerminal };
}
