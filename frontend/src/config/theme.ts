/**
 * BITAINTEL Centralized Theme System
 *
 * SINGLE SOURCE OF TRUTH for the entire application's primary color theme.
 * Change `themeConfig.primaryColor` to any supported Tailwind color family
 * (e.g., 'sky', 'blue', 'indigo', 'violet', 'emerald', 'rose', 'amber', etc.)
 * to update the entire application's primary palette and semantic tokens.
 */

export type ColorShades = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type TailwindColorFamily =
  | 'bitaintel'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan';

/**
 * Official BITAINTEL Logo & Tailwind CSS color palettes
 */
export const tailwindPalettes: Record<TailwindColorFamily, ColorShades> = {
  bitaintel: {
    50: '#EFF2FB',
    100: '#DBE2F5',
    200: '#B8C4EA',
    300: '#889DDD',
    400: '#5170CD',
    500: '#3051B5',
    600: '#28428F',
    700: '#223671', // Official BITAINTEL Logo Primary Blue ("bita")
    800: '#1A2956',
    900: '#121E3F',
    950: '#0A1229',
  },
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },
  indigo: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },
  fuchsia: {
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
    950: '#4A044E',
  },
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    950: '#500724',
  },
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
    950: '#4C0519',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
    950: '#422006',
  },
  lime: {
    50: '#F7FEE7',
    100: '#ECFCCB',
    200: '#D9F99D',
    300: '#BEF264',
    400: '#A3E635',
    500: '#84CC16',
    600: '#65A30D',
    700: '#4D7C0F',
    800: '#3F6212',
    900: '#365314',
    950: '#1A2E05',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    950: '#042F2E',
  },
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
};

/**
 * -----------------------------------------------------------------------------
 * 1. CENTRALIZED THEME CONFIGURATION
 * -----------------------------------------------------------------------------
 * Change `primaryColor` here to change the entire website's primary theme.
 * Supported options: 'bitaintel' | 'sky' | 'blue' | 'indigo' | 'violet' |
 * 'purple' | 'fuchsia' | 'pink' | 'rose' | 'red' | 'orange' | 'amber' |
 * 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan'
 */
export const themeConfig: { primaryColor: TailwindColorFamily } = {
  primaryColor: 'bitaintel',
};

/**
 * Official Logo Color Metadata
 */
export const logoColors = {
  primary: '#223671', // "bita" deep corporate navy blue
  neutral: '#5C5D5E', // "intel" technological slate charcoal
} as const;

/**
 * Helper to convert hex string to RGB numbers
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Returns the active color shades for the configured or requested primary color
 */
export function getPrimaryPalette(family: TailwindColorFamily = themeConfig.primaryColor): ColorShades {
  return tailwindPalettes[family] || tailwindPalettes.bitaintel;
}

/**
 * Generates an object of CSS custom property names and values for the primary palette
 * and semantic tokens.
 */
export function getThemeVariables(family: TailwindColorFamily = themeConfig.primaryColor): Record<string, string> {
  const p = getPrimaryPalette(family);
  const rgb600 = hexToRgb(p[600]);
  const rgb500 = hexToRgb(p[500]);
  const primaryGlow = `rgba(${rgb600.r}, ${rgb600.g}, ${rgb600.b}, 0.28)`;
  const primaryRing = `rgba(${rgb500.r}, ${rgb500.g}, ${rgb500.b}, 0.35)`;

  return {
    // Primary Shades 50 - 950
    '--primary-50': p[50],
    '--primary-100': p[100],
    '--primary-200': p[200],
    '--primary-300': p[300],
    '--primary-400': p[400],
    '--primary-500': p[500],
    '--primary-600': p[600],
    '--primary-700': p[700],
    '--primary-800': p[800],
    '--primary-900': p[900],
    '--primary-950': p[950],

    // Primary Semantic Tokens
    '--primary': p[600],
    '--primary-hover': p[700],
    '--primary-active': p[800],
    '--primary-light': p[50],
    '--primary-subtle': p[100],
    '--primary-border': p[200],
    '--primary-foreground': '#FFFFFF',
    '--primary-glow': primaryGlow,

    // Brand Aliases (for backward compatibility)
    '--brand': p[600],
    '--brand-strong': p[700],
    '--brand-light': p[400],
    '--brand-soft': p[50],
    '--brand-glow': primaryGlow,

    // Deep Ink / Bento Surfaces
    '--ink': p[950],
    '--ink-soft': p[900],
    '--ink-card': p[800],

    // Neutral & Base Tokens
    '--background': '#F8FAFC',
    '--foreground': '#0F172A',
    '--card': '#FFFFFF',
    '--card-foreground': '#0F172A',
    '--popover': '#FFFFFF',
    '--popover-foreground': '#0F172A',
    '--canvas': '#F8FAFC',
    '--surface': '#FFFFFF',
    '--surface-glass': 'rgba(255, 255, 255, 0.85)',
    '--surface-glass-strong': 'rgba(255, 255, 255, 0.94)',
    '--surface-glass-dark': `rgba(${hexToRgb(p[950]).r}, ${hexToRgb(p[950]).g}, ${hexToRgb(p[950]).b}, 0.88)`,
    '--surface-muted': '#F1F5F9',

    // Text & Border (Harmonized with Logo Slate Charcoal #5C5D5E)
    '--text': '#0F172A',
    '--text-secondary': family === 'bitaintel' ? '#5C5D5E' : '#334155',
    '--muted': family === 'bitaintel' ? '#5C5D5E' : '#64748B',
    '--muted-foreground': family === 'bitaintel' ? '#5C5D5E' : '#64748B',
    '--text-muted': family === 'bitaintel' ? '#5C5D5E' : '#64748B',
    '--text-inverse': '#FFFFFF',
    '--border': '#E2E8F0',
    '--border-glass': 'rgba(255, 255, 255, 0.85)',
    '--border-subtle': '#E2E8F0',
    '--input': '#E2E8F0',
    '--ring': primaryRing,
    '--focus': p[600],

    // Logo brand tokens
    '--logo-primary': '#223671',
    '--logo-neutral': '#5C5D5E',

    // Semantic Status Colors (Separated from Primary!)
    '--success': '#059669', // Emerald 600
    '--success-strong': '#047857',
    '--success-soft': '#ECFDF5',
    '--warning': '#D97706', // Amber 600
    '--warning-soft': '#FFFBEB',
    '--destructive': '#E11D48', // Rose 600
    '--danger': '#E11D48',
    '--danger-soft': '#FFF1F2',
    '--info': p[600],
    '--info-soft': p[50],

    // Pastel Tokens mapped to Primary
    '--pastel-primary': p[50],
    '--pastel-primary-border': p[200],
    '--pastel-primary-text': p[700],
    '--pastel-sky': p[50],
    '--pastel-sky-border': p[200],
    '--pastel-sky-text': p[700],
  };
}

/**
 * Returns a CSS string suitable for injection in `<style id="theme-tokens">`
 */
export function getThemeCssString(family: TailwindColorFamily = themeConfig.primaryColor): string {
  const vars = getThemeVariables(family);
  const rules = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${rules}\n}`;
}

/**
 * Authoritative TypeScript Design Tokens
 */
export const theme = {
  get primary() {
    return getPrimaryPalette(themeConfig.primaryColor);
  },
  colors: {
    primary: {
      DEFAULT: 'var(--primary)',
      hover: 'var(--primary-hover)',
      active: 'var(--primary-active)',
      light: 'var(--primary-light)',
      subtle: 'var(--primary-subtle)',
      border: 'var(--primary-border)',
      foreground: 'var(--primary-foreground)',
      glow: 'var(--primary-glow)',
      50: 'var(--primary-50)',
      100: 'var(--primary-100)',
      200: 'var(--primary-200)',
      300: 'var(--primary-300)',
      400: 'var(--primary-400)',
      500: 'var(--primary-500)',
      600: 'var(--primary-600)',
      700: 'var(--primary-700)',
      800: 'var(--primary-800)',
      900: 'var(--primary-900)',
      950: 'var(--primary-950)',
    },
    brand: {
      DEFAULT: 'var(--brand)',
      strong: 'var(--brand-strong)',
      light: 'var(--brand-light)',
      soft: 'var(--brand-soft)',
      glow: 'var(--brand-glow)',
    },
    ink: {
      DEFAULT: 'var(--ink)',
      soft: 'var(--ink-soft)',
      card: 'var(--ink-card)',
    },
    canvas: 'var(--canvas)',
    surface: {
      DEFAULT: 'var(--surface)',
      glass: 'var(--surface-glass)',
      glassStrong: 'var(--surface-glass-strong)',
      glassDark: 'var(--surface-glass-dark)',
      muted: 'var(--surface-muted)',
    },
    text: {
      DEFAULT: 'var(--text)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--muted)',
      inverse: 'var(--text-inverse)',
    },
    border: {
      DEFAULT: 'var(--border)',
      glass: 'var(--border-glass)',
      subtle: 'var(--border-subtle)',
      glassDark: 'var(--border-glass-dark)',
    },
    status: {
      success: 'var(--success)',
      successSoft: 'var(--success-soft)',
      warning: 'var(--warning)',
      warningSoft: 'var(--warning-soft)',
      danger: 'var(--danger)',
      dangerSoft: 'var(--danger-soft)',
      info: 'var(--info)',
      infoSoft: 'var(--info-soft)',
    },
    focus: 'var(--focus)',
    ring: 'var(--ring)',
  },
  radii: {
    pill: 'var(--radius-pill)',
    card: 'var(--radius-card)',
    bento: 'var(--radius-bento)',
  },
} as const;

export type Theme = typeof theme;
