// Design System Typography - Matching iOS TDFont
// Font: Pretendard (Google Fonts: Noto Sans KR as fallback)

export const fontWeight = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

export const fontSize = {
  header1: 34,
  header2: 24,
  header3: 20,
  header4: 18,
  header5: 16,
  body1: 16,
  body2: 14,
  body3: 14,
  body4: 15,
  button: 12,
  caption1: 12,
  caption2: 10,
  caption3: 9,
} as const;

export const typography = {
  // Medium Headers
  mediumHeader1: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.header1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumHeader2: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.header2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumHeader3: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.header3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumHeader4: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.header4,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumHeader5: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.header5,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // Bold Headers (using semiBold)
  boldHeader1: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.header1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldHeader2: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.header2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldHeader3: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.header3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldHeader4: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.header4,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldHeader5: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.header5,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // Body Styles
  mediumBody1: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.body1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldBody1: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.body1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  regularBody2: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.body2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumBody2: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.body2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldBody2: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.body2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  regularBody3: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.body3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumBody3: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.body3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldBody3: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.body3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  regularBody4: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.body4,
    lineHeight: 1.6,
    letterSpacing: '-0.02em',
  },

  // Button Styles
  mediumButton: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.button,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldButton: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.button,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  // Caption Styles
  regularCaption1: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.caption1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumCaption1: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.caption1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldCaption1: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.caption1,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  regularCaption2: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.caption2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumCaption2: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.caption2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  boldCaption2: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.caption2,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  regularCaption3: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.caption3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  mediumCaption3: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.caption3,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
} as const;

export type TypographyToken = keyof typeof typography;
