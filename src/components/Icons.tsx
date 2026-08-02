

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

export const IconSpoon = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="m5 19 5-5" />
    <path d="M10 14c-.5-2.5 1-5 3.5-6.5C15 6 18 5 21 3c-2 3-3 6-4.5 7.5-1.5 2.5-4 4-6.5 3.5z" />
  </svg>
);

export const IconShield = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconCandy = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <circle cx="12" cy="12" r="5" />
    <path d="M8.5 8.5l-4-4 3-3 4 4" />
    <path d="M15.5 15.5l4 4-3 3-4-4" />
  </svg>
);

export const IconFlask = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M9 3h6" />
    <path d="M10 3v4l-6 11a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-6-11V3" />
    <path d="M6 14h12" />
  </svg>
);

export const IconPalette = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.66 0 3-1.34 3-3 0-.35-.07-.69-.21-1-.45-.98.24-2.12 1.34-2.12H18c2.21 0 4-1.79 4-4 0-5.52-4.48-10-10-10z" />
  </svg>
);

export const IconLeaf = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const IconHeart = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const IconScale = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M12 3v18" />
    <path d="M3 8l9-4 9 4" />
    <path d="M5 8v5a7 7 0 0 0 14 0V8" />
    <path d="M9 13l3-3 3 3" />
  </svg>
);

export const IconSugarCube = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const IconSaltShaker = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <rect x="7" y="10" width="10" height="12" rx="3" ry="3" />
    <path d="M9 10V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconDroplet = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

export const IconSparkle = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export const IconCross = ({ size = 24, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

export const IconCheck = ({ size = 24, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconWarning = ({ size = 24, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconTransFatDroplet = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export const IconThumbsDown = ({ size = 24, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);
