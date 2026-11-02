// Animation cartographique premium pour la page de connexion
import { useEffect, useRef } from "react";

const PIN = "M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z";

const ROUTES_D = [
  "M-20 120 C 80 160, 140 60, 220 130 S 360 200, 440 150",
  "M-20 330 C 60 280, 150 380, 230 320 S 350 260, 440 340",
  "M60 -20 C 100 100, 40 220, 130 300 S 200 460, 150 620",
  "M330 -20 C 290 120, 380 200, 300 300 S 260 480, 330 620",
  "M-20 520 C 90 470, 180 560, 260 500 S 380 470, 440 520",
];

const NODES = [[220, 130], [230, 320], [130, 300], [300, 300], [260, 500]];

const PINS = [
  { x: 130, y: 150, s: 2.2, primary: false, delay: "0s" },
  { x: 270, y: 300, s: 3.0, primary: true,  delay: "0.3s" },
  { x: 90,  y: 430, s: 1.7, primary: false, delay: "0.6s" },
  { x: 300, y: 90,  s: 1.5, primary: false, delay: "0.9s" },
  { x: 200, y: 520, s: 1.3, primary: false, delay: "1.2s" },
];

export default function RouteArt() {
  return (
    <div className="login-art" aria-hidden="true">
      <svg className="art-bg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="artGrad" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#1a3d2e" />
            <stop offset="50%" stopColor="#0f2a1e" />
            <stop offset="100%" stopColor="#071510" />
          </linearGradient>
          <radialGradient id="glow1" cx="0.65" cy="0.45" r="0.55">
            <stop offset="0%" stopColor="#0ba67c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ba67c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow2" cx="0.25" cy="0.75" r="0.4">
            <stop offset="0%" stopColor="#0ba67c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ba67c" stopOpacity="0" />
          </radialGradient>
          <filter id="pinShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fond gradient */}
        <rect width="400" height="600" fill="url(#artGrad)" />
        <rect width="400" height="600" fill="url(#glow1)" />
        <rect width="400" height="600" fill="url(#glow2)" />

        {/* Grille cartographique subtile */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600"
            stroke="#fff" strokeOpacity="0.04" />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50}
            stroke="#fff" strokeOpacity="0.04" />
        ))}

        {/* Routes avec animation de dessin */}
        {ROUTES_D.map((d, i) => (
          <g key={i}>
            {/* Corps de la route */}
            <path d={d} fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="13" strokeLinecap="round" />
            {/* Pointillés animés */}
            <path
              d={d} fill="none" stroke="#fff" strokeOpacity="0.6"
              strokeWidth="1.8" strokeDasharray="3 10" strokeLinecap="round"
              style={{
                animation: `dashMove ${3 + i * 0.7}s linear infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          </g>
        ))}

        {/* Nœuds d'intersection avec pulsation */}
        {NODES.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="10" fill="#0ba67c" fillOpacity="0.15"
              style={{ animation: `nodeRipple 2.5s ease-out infinite`, animationDelay: `${i * 0.5}s` }}
            />
            <circle cx={x} cy={y} r="5.5" fill="#0ba67c" stroke="#fff" strokeWidth="2" />
            <circle cx={x} cy={y} r="3" fill="#e8fff7" />
          </g>
        ))}

        {/* Pins avec animation de chute + rebond */}
        {PINS.map((p, i) => (
          <g
            key={i}
            transform={`translate(${p.x} ${p.y}) scale(${p.s}) translate(-12 -22)`}
            filter="url(#pinShadow)"
            style={{
              animation: `pinDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
              animationDelay: p.delay,
            }}
          >
            <path d={PIN} fill={p.primary ? "#0ba67c" : "rgba(255,255,255,0.9)"} />
            {p.primary && (
              <>
                {/* Halo pulsant sur le pin principal */}
                <circle cx="12" cy="9" r="22" fill="#0ba67c" fillOpacity="0"
                  style={{ animation: `pinPulse 2s ease-out infinite`, animationDelay: "1s" }}
                />
              </>
            )}
          </g>
        ))}

        {/* Particules flottantes */}
        {[
          { x: 60, y: 200 }, { x: 350, y: 150 }, { x: 180, y: 420 },
          { x: 310, y: 450 }, { x: 100, y: 560 },
        ].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="2" fill="#0ba67c" fillOpacity="0.5"
            style={{ animation: `float ${3 + i}s ease-in-out infinite alternate`, animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </svg>

      {/* Vague — version verticale (desktop) */}
      <svg className="wave wave-v" viewBox="0 0 110 600" preserveAspectRatio="none">
        <defs>
          <filter id="waveShadow">
            <feDropShadow dx="-4" dy="0" stdDeviation="6" floodOpacity="0.2" />
          </filter>
        </defs>
        {[
          ["#b8ccc3", 42],
          ["#cdd8d2", 32],
          ["#dfe9e4", 20],
          ["#eef3f0", 10],
          ["#ffffff", 0],
        ].map(([fill, dx]) => (
          <path
            key={String(fill)}
            fill={String(fill)}
            filter="url(#waveShadow)"
            transform={`translate(${dx} 0)`}
            d="M0 0 H70 C 28 100, 98 210, 55 320 S 100 510, 60 600 H0 Z"
          />
        ))}
      </svg>

      {/* Vague — version horizontale (mobile) */}
      <svg className="wave wave-h" viewBox="0 0 600 110" preserveAspectRatio="none">
        <defs>
          <filter id="waveShadowH">
            <feDropShadow dx="0" dy="-4" stdDeviation="6" floodOpacity="0.18" />
          </filter>
        </defs>
        {[
          ["#b8ccc3", -42],
          ["#cdd8d2", -32],
          ["#dfe9e4", -20],
          ["#eef3f0", -10],
          ["#ffffff", 0],
        ].map(([fill, dy]) => (
          <path
            key={String(fill)}
            fill={String(fill)}
            filter="url(#waveShadowH)"
            transform={`translate(0 ${dy})`}
            d="M0 110 V52 C 110 8, 210 92, 320 50 S 510 10, 600 56 V110 Z"
          />
        ))}
      </svg>
    </div>
  );
}
