import React from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import noEventImage from "../../assets/images/empty/noEvent.png";

interface DiaryEmptyStateProps {
  message?: string;
}

export const DiaryEmptyState: React.FC<DiaryEmptyStateProps> = ({
  message = "일기를 작성하지 않았어요",
}) => {
  // iOS: noDiaryContainerView height 280, backgroundColor neutral100
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: 280,
    backgroundColor: colors.neutral[100],
    paddingTop: 40, // iOS: noDiaryImageView top 40
    paddingBottom: 360,
  };

  // iOS: noDiaryImageView - contentMode scaleAspectFit
  const imageStyle: React.CSSProperties = {
    height: 120,
    objectFit: "contain",
  };

  // iOS: noDiaryLabel - boldBody1, neutral600, top 24 from image
  const labelStyle: React.CSSProperties = {
    marginTop: 24,
    fontSize: typography.boldBody1.fontSize,
    fontWeight: typography.boldBody1.fontWeight,
    color: colors.neutral[600],
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <img src={noEventImage} alt="no diary" style={imageStyle} />
      <span style={labelStyle}>{message}</span>
    </div>
  );
};
