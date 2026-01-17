import React, { useRef, useEffect, useState } from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";

interface TDSegmentedControlProps {
  items: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width?: number | string;
  variant?: "filled" | "underline";
  style?: React.CSSProperties;
}

export const TDSegmentedControl: React.FC<TDSegmentedControlProps> = ({
  items,
  selectedIndex,
  onChange,
  width = 130,
  variant = "filled",
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (variant === "underline" && containerRef.current) {
      const buttons = containerRef.current.querySelectorAll("button");
      const selectedButton = buttons[selectedIndex];
      if (selectedButton) {
        setIndicatorStyle({
          width: selectedButton.offsetWidth,
          transform: `translateX(${selectedButton.offsetLeft}px)`,
        });
      }
    }
  }, [selectedIndex, variant, items]);

  if (variant === "underline") {
    const underlineContainerStyle: React.CSSProperties = {
      display: "flex",
      width,
      position: "relative",
      ...style,
    };

    const underlineButtonStyle = (index: number): React.CSSProperties => {
      const isSelected = index === selectedIndex;
      return {
        flex: 1,
        padding: "12px 0",
        backgroundColor: "transparent",
        border: "none",
        fontSize: typography.boldHeader5.fontSize,
        fontWeight: typography.boldHeader5.fontWeight,
        color: isSelected ? colors.neutral[800] : colors.neutral[500],
        cursor: "pointer",
        transition: "color 0.2s ease",
      };
    };

    const indicatorBaseStyle: React.CSSProperties = {
      position: "absolute",
      bottom: "1px",
      left: 0,
      height: 2,
      backgroundColor: colors.neutral[800],
      transition:
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      ...indicatorStyle,
    };

    const backgroundLineStyle: React.CSSProperties = {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.baseWhite,
    };

    return (
      <div ref={containerRef} style={underlineContainerStyle}>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            style={underlineButtonStyle(index)}
          >
            {item}
          </button>
        ))}
        <div style={backgroundLineStyle} />
        <div style={indicatorBaseStyle} />
      </div>
    );
  }

  // Filled variant (original)
  const containerStyle: React.CSSProperties = {
    display: "flex",
    width,
    height: 43,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: 4,
    ...style,
  };

  const getItemStyle = (index: number): React.CSSProperties => {
    const isSelected = index === selectedIndex;
    return {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isSelected ? colors.baseWhite : "transparent",
      borderRadius: 6,
      fontSize: typography.mediumBody2.fontSize,
      fontWeight: isSelected
        ? typography.boldBody2.fontWeight
        : typography.mediumBody2.fontWeight,
      letterSpacing: typography.mediumBody2.letterSpacing,
      color: isSelected ? colors.neutral[800] : colors.neutral[600],
      cursor: "pointer",
      transition: "all 0.2s ease",
      border: "none",
      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
    };
  };

  return (
    <div style={containerStyle}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => onChange(index)}
          style={getItemStyle(index)}
        >
          {item}
        </button>
      ))}
    </div>
  );
};
