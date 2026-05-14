// ── FinTech Mobil — Tasarım Sistemi ──────────────────────────
// Web projesinden aynen aktarılan renk paleti ve spacing değerleri

export const COLORS = {
  // Birincil
  primary:   '#11142D',
  primary2:  '#2C3142',
  indigo:    '#4318FF',
  indigo2:   '#6C5CE7',

  // Durumlar
  green:     '#22C55E',
  red:       '#EF4444',
  yellow:    '#F59E0B',
  orange:    '#F97316',

  // Arka plan
  bg:        '#FAFBFC',
  bg2:       '#F0F2F5',
  bg3:       '#E4E7EB',
  card:      '#FFFFFF',
  card2:     '#F9FAFB',

  // Metin
  text1:     '#11142D',
  text2:     '#808191',
  text3:     '#A3AED0',

  // Kenarlık
  border:    '#F1F1F5',
  border2:   '#E2E8F0',

  // Pastel arka planlar (dashboard kartları)
  pastelYellow: '#FCEACC',
  pastelGreen:  '#D2F6F1',
  pastelLime:   '#D8F5C1',
  pastelPurple: '#E6D4F9',
  pastelIndigo: '#F4F7FE',

  // Özel
  white:     '#FFFFFF',
  black:     '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 11,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  hero: 32,
  mega: 36,
};

export const FONT_WEIGHT = {
  normal:    '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
  black:     '900',
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
};
