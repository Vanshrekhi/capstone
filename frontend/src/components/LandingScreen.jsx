export default function LandingScreen({ onStart, isCreating, error }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">

      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orbs */}
        <div className="animate-orb absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="animate-orb-d3 absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="animate-orb-d6 absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #0891b2 0%, transparent 70%)', filter: 'blur(80px)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'linear-gradient(#1e1e35 1px, transparent 1px), linear-gradient(90deg, #1e1e35 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)',
          }} />
      </div>

      {/* ── Content ── */}
      <div className="animate-fade-up relative z-10 flex flex-col items-center gap-7 text-center max-w-[700px] px-6 py-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-950/50 border border-violet-700/40 rounded-full text-xs font-medium text-violet-400 tracking-wide">
          <span className="animate-badge w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
          AI-Powered Development Environment
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-[#e8e8ff]">
          Build Faster with
          <span className="gradient-text"> AI Sandbox</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-[#9090bb] leading-relaxed max-w-[520px]">
          Spin up an instant cloud environment, describe what you want to build,
          and watch the AI write, run, and preview your code in real time.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[560px]">
          {[
            { icon: '⚡', label: 'Instant Environment', desc: 'Ready in seconds' },
            { icon: '🤖', label: 'AI Code Generation', desc: 'Powered by LLM' },
            { icon: '👁️', label: 'Live Preview', desc: 'See changes instantly' },
            { icon: '🖥️', label: 'Real Terminal', desc: 'Full shell access' },
          ].map(f => (
            <div key={f.label}
              className="flex items-center gap-3 px-4 py-3.5 bg-[#1a1a2e] border border-[#252540] rounded-xl text-left transition-all duration-200 hover:border-[#30305a] hover:bg-[#1e1e35] hover:-translate-y-px">
              <span className="text-[22px] leading-none flex-shrink-0">{f.icon}</span>
              <div>
                <div className="text-[13px] font-semibold text-[#e8e8ff]">{f.label}</div>
                <div className="text-[11px] text-[#555580] mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-950/40 border border-red-700/40 rounded-xl text-red-400 text-[13px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          id="start-sandbox-btn"
          onClick={onStart}
          disabled={isCreating}
          className={`
            inline-flex items-center gap-2.5 px-9 py-4 rounded-full font-semibold text-[15px] text-white
            bg-gradient-to-br from-violet-600 to-violet-800
            border border-violet-500/30
            shadow-[0_0_40px_rgba(124,58,237,0.3),0_4px_16px_rgba(0,0,0,0.3)]
            transition-all duration-200
            ${isCreating ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(124,58,237,0.5),0_8px_24px_rgba(0,0,0,0.4)] active:translate-y-0'}
          `}
        >
          {isCreating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Creating Sandbox...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Launch Sandbox
            </>
          )}
        </button>

        <p className="text-xs text-[#555580]">
          Your sandbox will auto-provision a full React + Vite environment
        </p>
      </div>
    </div>
  );
}
