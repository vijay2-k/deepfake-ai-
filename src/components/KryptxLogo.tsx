import React from 'react';

interface KryptxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showCategory?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KryptxSymbol: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-all duration-300 drop-shadow-[0_0_12px_rgba(0,229,255,0.45)] hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.65)] ${className}`}
    >
      <defs>
        {/* Holographic Cyan-to-Violet Gradient */}
        <linearGradient id="kryptx-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="45%" stopColor="#267CFF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Upper Shard Electric Gradient */}
        <linearGradient id="kryptx-grad-upper" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#267CFF" />
          <stop offset="60%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>

        {/* Lower Shard Violet Gradient */}
        <linearGradient id="kryptx-grad-lower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="70%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>

        {/* Accent Glow Filter */}
        <filter id="kryptx-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal / Diamond Framing Matrix Guide (subtle cyber grid) */}
      <polygon
        points="50,4 92,26 92,74 50,96 8,74 8,26"
        fill="none"
        stroke="rgba(0, 229, 255, 0.12)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />

      {/* Geometric K - Vertical Spine Prism with Precision Chamfers */}
      <path
        d="M 22 14 L 38 14 L 38 86 L 22 86 L 22 14 Z"
        fill="url(#kryptx-grad-1)"
        className="opacity-95"
      />
      {/* Precision Chamfered Highlight Edge */}
      <path
        d="M 22 14 L 28 8 L 38 14 L 32 86 L 22 86 Z"
        fill="#FFFFFF"
        opacity="0.18"
      />

      {/* Geometric K - Upper Diagonal Shard (Angled Precision Cut) */}
      <path
        d="M 43 47 L 76 16 L 89 25 L 53 57 Z"
        fill="url(#kryptx-grad-upper)"
      />
      {/* Upper shard neon light edge */}
      <line
        x1="76"
        y1="16"
        x2="89"
        y2="25"
        stroke="#E0F7FF"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#kryptx-glow)"
      />

      {/* Geometric K - Lower Diagonal Shard (Cyber Prism Cut) */}
      <path
        d="M 46 48 L 74 84 L 88 74 L 57 40 Z"
        fill="url(#kryptx-grad-lower)"
      />

      {/* Interconnecting Digital Quantum Node at the Nexus */}
      <polygon
        points="43,45 55,38 60,49 48,56"
        fill="#00E5FF"
        opacity="0.9"
        filter="url(#kryptx-glow)"
      />

      {/* Holographic Quantum Dot / Center Target */}
      <circle cx="51" cy="47" r="2.2" fill="#FFFFFF" />
      <circle cx="82" cy="20" r="1.5" fill="#00E5FF" />
      <circle cx="81" cy="79" r="1.5" fill="#8B5CF6" />
    </svg>
  );
};

export const KryptxLogo: React.FC<KryptxLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showCategory = true,
  className = '',
  onClick,
}) => {
  const pixelSize = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 60,
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* Standalone Geometric K Symbol */}
      <div className="relative flex items-center justify-center p-1 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10 transition-all duration-300">
        <KryptxSymbol size={pixelSize} />
      </div>

      {/* Wordmark & Category */}
      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold tracking-wider text-white text-lg sm:text-xl leading-none flex items-center">
              KRYPT<span className="text-[#00E5FF] group-hover:text-cyan-300 transition-colors">X</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest font-semibold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              FORENSICS
            </span>
          </div>

          {showCategory && (
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-medium mt-0.5">
              Multimodal Forensic Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

