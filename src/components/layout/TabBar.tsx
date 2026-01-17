import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../styles/colors";
import { layout } from "../../styles/layout";
import { typography } from "../../styles/typography";

// Import iOS tab bar icons
import diaryIcon from "../../assets/images/tabbar/diary_medium.png";
import diaryActiveIcon from "../../assets/images/tabbar/diary_color_medium.png";
import socialIcon from "../../assets/images/tabbar/social_medium.png";
import socialActiveIcon from "../../assets/images/tabbar/social_color_medium.png";
import settingIcon from "../../assets/images/tabbar/setting_medium.png";
import settingActiveIcon from "../../assets/images/tabbar/setting_color_medium.png";

interface TabItem {
  path: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const tabs: TabItem[] = [
  {
    path: "/diary",
    label: "일기",
    icon: diaryIcon,
    activeIcon: diaryActiveIcon,
  },
  {
    path: "/social",
    label: "소셜",
    icon: socialIcon,
    activeIcon: socialActiveIcon,
  },
  {
    path: "/mypage",
    label: "마이페이지",
    icon: settingIcon,
    activeIcon: settingActiveIcon,
  },
];

export const TabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: layout.tabBarHeight,
    backgroundColor: colors.baseWhite,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    maxWidth: 430,
    zIndex: 100,
    borderTop: `1px solid ${colors.neutral[300]}`,
    borderLeft: "1px solid rgb(248, 248, 248)",
    borderRight: "1px solid rgb(248, 248, 248)",
  };

  const getTabStyle = (): React.CSSProperties => ({
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  });

  const getLabelStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: typography.regularCaption2.fontSize,
    fontWeight: isActive
      ? typography.mediumCaption2.fontWeight
      : typography.regularCaption2.fontWeight,
    color: isActive ? colors.primary[400] : colors.neutral[600],
    letterSpacing: typography.regularCaption2.letterSpacing,
    marginTop: 2,
  });

  const iconStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    objectFit: "contain",
  };

  return (
    <nav style={containerStyle}>
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={getTabStyle()}
          >
            <img
              src={isActive ? tab.activeIcon : tab.icon}
              alt={tab.label}
              style={iconStyle}
            />
            <span style={getLabelStyle(isActive)}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
