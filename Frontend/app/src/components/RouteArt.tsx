// Décor de la page de connexion : papier découpé vert + routes + repères de géolocalisation
const PIN = "M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z";

const PINS = [
  { x: 130, y: 150, s: 2.2, o: 0.95 },
  { x: 270, y: 300, s: 3, o: 1 },
  { x: 90, y: 430, s: 1.7, o: 0.8 },
  { x: 300, y: 90, s: 1.5, o: 0.7 },
  { x: 200, y: 520, s: 1.3, o: 0.6 },
];

const ROUTES_D = [
  "M-20 120 C 80 160, 140 60, 220 130 S 360 200, 440 150",
  "M-20 330 C 60 280, 150 380, 230 320 S 350 260, 440 340",
  "M60 -20 C 100 100, 40 220, 130 300 S 200 460, 150 620",
  "M330 -20 C 290 120, 380 200, 300 300 S 260 480, 330 620",
  "M-20 520 C 90 470, 180 560, 260 500 S 380 470, 440 520",
];

const NODES = [[220, 130], [230, 320], [130, 300], [300, 300], [260, 500]];

export default function RouteArt() {
  return (
    <div className="login-art" aria-hidden="true">
      <svg className="art-bg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2f5a46" />
            <stop offset="1" stopColor="#14271e" />
          </linearGradient>
          <radialGradient id="glow" cx="0.7" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#0ba67c" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0ba67c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="600" fill="url(#g)" />
        <rect width="400" height="600" fill="url(#glow)" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="#fff" strokeOpacity="0.05" />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#fff" strokeOpacity="0.05" />
        ))}
        {ROUTES_D.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="14" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
          </g>
        ))}
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#0ba67c" stroke="#fff" strokeWidth="2" />
        ))}
        {PINS.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s}) translate(-12 -22)`} opacity={p.o}>
            <path d={PIN} fill={i === 1 ? "#0ba67c" : "#fff"} />
          </g>
        ))}
      </svg>

      {/* Vagues en papier : verticales (bureau) puis horizontales (mobile) */}
      <svg className="wave wave-v" viewBox="0 0 100 600" preserveAspectRatio="none">
        <defs>
          <filter id="sh" x="-20%" y="-5%" width="140%" height="110%">
            <feDropShadow dx="2" dy="0" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>
        {[["#cdd8d2", 34], ["#e6ece8", 22], ["#f3f6f4", 11], ["#ffffff", 0]].map(([fill, dx]) => (
          <path key={String(fill)} fill={String(fill)} filter="url(#sh)" transform={`translate(${dx} 0)`}
            d="M0 0 H66 C 26 110, 92 210, 52 320 S 94 520, 58 600 H0 Z" />
        ))}
      </svg>
      <svg className="wave wave-h" viewBox="0 0 600 100" preserveAspectRatio="none">
        {[["#cdd8d2", -34], ["#e6ece8", -22], ["#f3f6f4", -11], ["#ffffff", 0]].map(([fill, dy]) => (
          <path key={String(fill)} fill={String(fill)} filter="url(#sh)" transform={`translate(0 ${dy})`}
            d="M0 100 V46 C 110 4, 210 88, 320 46 S 520 8, 600 54 V100 Z" />
        ))}
      </svg>
    </div>
  );
}
