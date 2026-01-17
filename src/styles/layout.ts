// Design System Layout Constants - Matching iOS Layout

export const layout = {
  // Common spacing
  horizontalInset: 24,
  inputPadding: 16,
  sectionHorizontalInset: 16,

  // Input fields
  inputFieldHeight: 56,
  inputFieldCornerRadius: 8,
  inputSpacing: 10,

  // Buttons
  buttonHeight: 48,
  buttonCornerRadius: 12,
  buttonBottomSpacing: 16,

  // Title and spacing
  titleTopOffset: 16,
  subtitleSpacing: 12,
  sectionSpacing: 60,
  inputFieldSpacing: 26,

  // Find account
  findAccountSpacing: 18,
  findAccountHeight: 24,
  findAccountWidth: 150,

  // Error container
  errorContainerCornerRadius: 8,
  errorContainerSpacing: 20,
  errorContainerHeight: 42,

  // Icon sizes
  iconSpacing: 4,
  iconSizeSmall: 16,
  iconSizeMedium: 24,
  iconSizeLarge: 36,

  // Avatar sizes
  avatarSizeSmall: 36,
  avatarSizeMedium: 48,
  avatarSizeLarge: 80,

  // Navigation bar
  navBarHeight: 56,

  // Tab bar
  tabBarHeight: 60,

  // Card/Container
  containerCornerRadius: 8,
  containerVerticalPadding: 12,
  containerHorizontalPadding: 16,

  // Stack spacing
  stackSpacing: {
    small: 8,
    medium: 10,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },

  // MyPage specific
  myPage: {
    profileImageSize: 80,
    profileImageCornerRadius: 40,
    menuStackViewSpacing: 10,
    menuViewHeight: 82,
    sectionItemSpacing: 6,
    sectionHeaderHeight: 50,
    customCellHeight: 41,
    footerPadding: 20,
  },

  // Diary specific
  diary: {
    analyzeViewHeight: 230,
    segmentedControlWidth: 130,
    postButtonContainerHeight: 112,
  },

  // Social specific
  social: {
    segmentedControlWidth: 133,
    segmentedControlHeight: 43,
    chipHeight: 33,
    chipCornerRadius: 8,
    addPostButtonWidth: 104,
    addPostButtonHeight: 50,
    addPostButtonRadius: 25,
    cellAvatarSize: 36,
    cellVerticalPadding: 20,
    cellContentLeading: 46, // avatar (36) + spacing (10)
    itemPadding: 10,
    groupPadding: 16,
  },
} as const;

export type LayoutToken = typeof layout;
