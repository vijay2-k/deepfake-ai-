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
      className={`transition-all duration-300 drop-shadow-[0_2px_10px_rgba(85,21,216,0.25)] hover:drop-shadow-[0_4px_16px_rgba(85,21,216,0.45)] ${className}`}
    >
      <defs>
        {/* Primary Purple to Electric Blue Gradient */}
        <linearGradient id="kryptx-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5515D8" />
          <stop offset="50%" stopColor="#7B2BFF" />
          <stop offset="100%" stopColor="#1677FF" />
        </linearGradient>

        {/* Upper Shard Cyan-Blue Accent Gradient */}
        <linearGradient id="kryptx-grad-upper" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3210A8" />
          <stop offset="60%" stopColor="#5515D8" />
          <stop offset="100%" stopColor="#00D9FF" />
        </linearGradient>

        {/* Lower Shard Deep Violet Gradient */}
        <linearGradient id="kryptx-grad-lower" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1F0866" />
          <stop offset="70%" stopColor="#5515D8" />
          <stop offset="100%" stopColor="#8B32FF" />
        </linearGradient>
      </defs>

      {/* Main Left Pillar */}
      <path
        d="M22 14C22 11.7909 23.7909 10 26 10H36C38.2091 10 40 11.7909 40 14V86C40 88.2091 38.2091 90 36 90H26C23.7909 90 22 88.2091 22 86V14Z"
        fill="url(#kryptx-grad-main)"
      />

      {/* Upper Diagonal Shard */}
      <path
        d="M44 48L68 18C69.5 16 72 15 74.5 15H83C85.5 15 87 18 85.5 20L58 55L44 48Z"
        fill="url(#kryptx-grad-upper)"
      />

      {/* Lower Diagonal Shard */}
      <path
        d="M52 46L82 82C83.5 84 82 87 79.5 87H70C67.5 87 65.5 86 64 84L42 56L52 46Z"
        fill="url(#kryptx-grad-lower)"
      />

      {/* Optical Core Specular Accent */}
      <circle cx="50" cy="50" r="3" fill="#00D9FF" opacity="0.9" />
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
  const sizeMap = {
    sm: { symbol: 26, text: 'text-base', sub: 'text-[8px]' },
    md: { symbol: 34, text: 'text-xl', sub: 'text-[9px]' },
    lg: { symbol: 42, text: 'text-2xl', sub: 'text-[10px]' },
    xl: { symbol: 54, text: 'text-3xl', sub: 'text-[11px]' },
  };

  const config = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <KryptxSymbol size={config.symbol} />

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-extrabold ${config.text} tracking-tight text-[#10132F] transition-colors`}
            >
              KRYPTX
            </span>
          </div>

          <div
            className={`font-mono font-bold ${config.sub} tracking-[0.24em] text-[#525779] uppercase`}
          >
            FORENSICS
          </div>
        </div>
      )}
    </div>
  );
};
