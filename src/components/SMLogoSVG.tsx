const SMLogoSVG = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="25%" stopColor="#F4E4BA" />
          <stop offset="50%" stopColor="#D9B370" />
          <stop offset="75%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="goldGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8D48B" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8962E" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        fill="none" 
        stroke="url(#goldGradient)" 
        strokeWidth="1.5"
        filter="url(#glow)"
      />
      
      {/* Celtic knot pattern - outer ring */}
      <g fill="none" stroke="url(#goldGradient)" strokeWidth="1.2" filter="url(#glow)">
        {/* Top curves */}
        <path d="M 50 8 Q 70 15, 85 30 Q 75 25, 65 28" />
        <path d="M 50 8 Q 30 15, 15 30 Q 25 25, 35 28" />
        
        {/* Right curves */}
        <path d="M 92 50 Q 85 30, 75 20 Q 80 35, 78 45" />
        <path d="M 92 50 Q 85 70, 75 80 Q 80 65, 78 55" />
        
        {/* Bottom curves */}
        <path d="M 50 92 Q 70 85, 85 70 Q 75 75, 65 72" />
        <path d="M 50 92 Q 30 85, 15 70 Q 25 75, 35 72" />
        
        {/* Left curves */}
        <path d="M 8 50 Q 15 30, 25 20 Q 20 35, 22 45" />
        <path d="M 8 50 Q 15 70, 25 80 Q 20 65, 22 55" />
      </g>
      
      {/* Inner decorative circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="38" 
        fill="none" 
        stroke="url(#goldGradient2)" 
        strokeWidth="1"
        opacity="0.7"
      />
      
      {/* Braided/Celtic knot detail ring */}
      <g fill="none" stroke="url(#goldGradient)" strokeWidth="2" opacity="0.9">
        <ellipse cx="50" cy="50" rx="42" ry="42" strokeDasharray="12 8" />
      </g>
      
      {/* S letter */}
      <text 
        x="32" 
        y="62" 
        fontFamily="Georgia, Times New Roman, serif" 
        fontSize="28" 
        fontWeight="400"
        fontStyle="italic"
        fill="url(#goldGradient)"
        filter="url(#glow)"
      >
        S
      </text>
      
      {/* M letter */}
      <text 
        x="46" 
        y="62" 
        fontFamily="Georgia, Times New Roman, serif" 
        fontSize="28" 
        fontWeight="600"
        fill="url(#goldGradient)"
        filter="url(#glow)"
      >
        M
      </text>
    </svg>
  );
};

export default SMLogoSVG;
