import React from "react";
import { colors } from "../../styles/colors";
import { layout } from "../../styles/layout";
import { Search, ChevronLeft } from "lucide-react";
import diaryNavigationIcon from "../../assets/images/logo/diaryNavigation.png";
import toduckLogoText from "../../assets/images/logo/toduck_Logo.png";

interface NavigationBarProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showLogo?: boolean;
  showSearchButton?: boolean;
  onSearchClick?: () => void;
  backgroundColor?: string;
  style?: React.CSSProperties;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  showLogo = true,
  showSearchButton = false,
  onSearchClick,
  backgroundColor = colors.baseWhite,
  style,
}) => {
  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 430,
    height: layout.navBarHeight,
    backgroundColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    boxSizing: "border-box",
    borderLeft: "1px solid rgb(248, 248, 248)",
    borderRight: "1px solid rgb(248, 248, 248)",
    ...style,
  };

  const leftContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const rightContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: 8,
  };

  return (
    <nav style={containerStyle}>
      <div style={leftContainerStyle}>
        {showBackButton && (
          <button onClick={onBackClick} style={iconButtonStyle}>
            <ChevronLeft size={24} color={colors.neutral[800]} />
          </button>
        )}
        {showLogo && !title && (
          <>
            <img
              src={diaryNavigationIcon}
              alt="toduck"
              style={{ width: 28, height: 28 }}
            />
            <img src={toduckLogoText} alt="toduck" style={{ height: 20 }} />
          </>
        )}
        {title && (
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.neutral[800],
            }}
          >
            {title}
          </span>
        )}
      </div>

      <div style={rightContainerStyle}>
        {showSearchButton && (
          <button onClick={onSearchClick} style={iconButtonStyle}>
            <Search size={24} color={colors.neutral[500]} />
          </button>
        )}
      </div>
    </nav>
  );
};
