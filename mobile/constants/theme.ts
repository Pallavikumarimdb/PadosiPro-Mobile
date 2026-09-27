/** Centralized design tokens mirroring the PadosiPro reference (Tailwind classes in components use these via tailwind.config). */
export const colors = {
  ink: '#101E2C',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E2E8F0',
  canvas: '#FAF9F6',
  card: '#FFFFFF',
  primary: '#0C5B40',
  primaryDark: '#084530',
  sage: '#9DBEAF',
  mint: '#EAF5EF',
  gold: '#C2912A',
  goldSoft: '#FEF6E0',
  danger: '#B91C1C',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { input: 12, card: 12, button: 12, pill: 999 } as const;
export const layout = { horizontalPadding: 20, inputHeight: 56, buttonHeight: 56 } as const;
