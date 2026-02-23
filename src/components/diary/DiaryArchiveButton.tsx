import React from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import listIcon from "../../assets/images/icons/list_Medium.png";

interface DiaryArchiveButtonProps {
  onClick: () => void;
}

export const DiaryArchiveButton: React.FC<DiaryArchiveButtonProps> = ({
  onClick,
}) => {
  // iOS: archiveButtonContainerView - height 72, backgroundColor neutral100
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 72,
    backgroundColor: colors.neutral[100],
  };

  // iOS: containerStack - horizontal, spacing 4, center, edges inset 16
  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: 16,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    minWidth: 162,
    minHeight: 48,
  };

  // iOS: title - mediumBody2, neutral600
  const textStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[600],
  };

  // iOS: calendarIcon - 24x24
  const iconStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    objectFit: "contain",
  };

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={onClick}>
        <span style={textStyle}>전체 일기 모아보기</span>
        <img src={listIcon} alt="" style={iconStyle} />
      </button>
    </div>
  );
};
