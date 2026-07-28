

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
    <path d="M7 17l-4 4" />
    <path d="M12 12c-2.761 0-5 2.239-5 5s2.239 5 5 5c4 0 7-5 7-10 0-1.105-.895-2-2-2s-2 .895-2 2v0z" transform="rotate(-45 12 12)" />
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
    <path d="M10.13 2.5a2 2 0 0 1 3.74 0l6.2 11.2A2 2 0 0 1 18.33 17H5.67a2 2 0 0 1-1.74-3.3z" />
  </svg>
);

export const IconSaltShaker = ({ size = 16, color = "currentColor" }) => (
  <svg {...svgProps} width={size} height={size} color={color}>
    <path d="M7 6v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6" />
    <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M12 12h.01" />
    <path d="M10 16h.01" />
    <path d="M14 16h.01" />
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
