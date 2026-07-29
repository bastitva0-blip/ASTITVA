interface LogoProps {
  size?: number
  showText?: boolean
}

export function Logo({ size = 36, showText = true }: LogoProps) {
  const id = `lg-${size}`
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${id}-a`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.08" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Outer hexagon */}
        <path
          d="M20 2.5 L36 11.25 L36 28.75 L20 37.5 L4 28.75 L4 11.25 Z"
          fill={`url(#${id}-a)`}
        />
        {/* Inner glow hex */}
        <path
          d="M20 8 L31 14 L31 26 L20 32 L9 26 L9 14 Z"
          fill={`url(#${id}-b)`}
        />
        {/* A — strokes */}
        <path
          d="M14.5 28 L20 13 L25.5 28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${id}-glow)`}
        />
        <path
          d="M16.8 22.5 L23.2 22.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Reflection hint */}
        <path
          d="M16 30 L20 33.5 L24 30"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontSize: size * 0.52,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Astitva
        </span>
      )}
    </div>
  )
}
