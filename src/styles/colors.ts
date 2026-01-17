// Design System Colors - Matching iOS TDColor
export const colors = {
  // Base Colors
  baseBlack: '#000000',
  baseWhite: '#FFFFFF',
  baseShadow: 'rgba(0, 0, 0, 0.08)',

  // Primary Colors (Orange)
  primary: {
    10: '#FFF9F3',
    25: '#FFF6EE',
    50: '#FFF1E5',
    100: '#FFE3CC',
    200: '#FFC799',
    300: '#FFAA66',
    400: '#FF8E33',
    500: '#FF7200', // Main brand color
    600: '#CC5B00',
    700: '#994400',
    800: '#662E00',
    900: '#331700',
    950: '#1A0B00',
  },

  // Neutral Colors (Gray)
  neutral: {
    50: '#FAFAFA',
    100: '#F6F6F6',
    200: '#F1F1F1',
    300: '#ECECEC',
    400: '#E2E2E2',
    500: '#CCCCCC',
    600: '#A0A0A0',
    700: '#7B7B7B',
    800: '#4C4C4C',
    900: '#141414',
  },

  // Semantic Colors
  semantic: {
    error: '#FF434B',
    info: '#648EF8',
    success: '#5BC566',
    warning: '#FFB421',
    sun: '#FFE3CC',
    moon: '#4E6384',
  },

  // Diary Emotion Colors
  diary: {
    happy: '#FFE8D4',
    angry: '#FFD2CC',
    anxiety: '#F1E8F7',
    sad: '#DEEEFC',
    soso: '#FFF7D9',
    tired: '#E2E2E2',
    good: '#DAF9DD',
    love: '#FFD6E2',
    sick: '#F1E8F7',
  },

  // Schedule Background Colors
  schedule: {
    back1: '#FFD6E2',
    back2: '#FFE3CC',
    back3: '#FFF7D9',
    back4: '#F0F4BF',
    back5: '#DAF9DD',
    back6: '#DEEEFC',
    back7: '#EAECFF',
    back8: '#F1E8F7',
    back9: '#F3E6D6',
    back10: '#ECECEC',
    back11: '#F0DFDF',
    back12: '#E7E4DD',
    back13: '#E3EEEA',
    back14: '#E4E9F3',
    back15: '#DADADA',
    back16: '#FFAA66',
    back17: '#FFB421',
    back18: '#C6CE00',
    back19: '#94B2FF',
    back20: '#A0A0A0',
  },

  // Schedule Text Colors
  scheduleText: {
    text1: '#FF3872',
    text2: '#FF7200',
    text3: '#FFB421',
    text4: '#A8B40E',
    text5: '#5BC566',
    text6: '#648EF8',
    text7: '#6372FF',
    text8: '#C876FF',
    text9: '#B7844C',
    text10: '#7B7B7B',
    text11: '#BD7E7E',
    text12: '#9F9376',
    text13: '#7C9E92',
    text14: '#7F92B9',
    text15: '#4C4C4C',
    text16: '#FFFFFF',
  },

  // Timer Colors
  timer: {
    start: '#5BC566',
    stop: '#FF434B',
  },

  // Kakao OAuth
  kakao: {
    background: '#FEE500',
    foreground: '#000000',
  },

  // Event Colors
  event: {
    background: '#FCF7DA',
    button: '#5B4612',
  },
} as const;

export type ColorToken = typeof colors;
