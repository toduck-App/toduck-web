import React from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { Routine, CategoryColor, CategoryIconType } from "../../types";

// Category icons
import computerIcon from "../../assets/icons/category/computer.png";
import foodIcon from "../../assets/icons/category/food.png";
import pencilIcon from "../../assets/icons/category/pencil.png";
import redBookIcon from "../../assets/icons/category/redBook.png";
import sleepIcon from "../../assets/icons/category/sleep.png";
import powerIcon from "../../assets/icons/category/power.png";
import peopleIcon from "../../assets/icons/category/people.png";
import medicineIcon from "../../assets/icons/category/medicine.png";
import talkIcon from "../../assets/icons/category/talk.png";
import heartIcon from "../../assets/icons/category/heart.png";
import vehicleIcon from "../../assets/icons/category/vehicle.png";
import noneIcon from "../../assets/icons/category/none.png";
import clockIcon from "../../assets/icons/clock.png";

interface SocialRoutineViewProps {
  routine: Routine;
  onClick?: () => void;
}

// iOS: TDColor.reversedOpacityBackPair - maps opacity back colors to solid back colors
const categoryBackgroundColors: Record<CategoryColor, string> = {
  back1: colors.schedule.back1,
  back2: colors.schedule.back2,
  back3: colors.schedule.back3,
  back4: colors.schedule.back4,
  back5: colors.schedule.back5,
  back6: colors.schedule.back6,
  back7: colors.schedule.back7,
  back8: colors.schedule.back8,
  back9: colors.schedule.back9,
  back10: colors.schedule.back10,
  back11: colors.schedule.back11,
  back12: colors.schedule.back12,
  back13: colors.schedule.back13,
  back14: colors.schedule.back14,
  back15: colors.schedule.back15,
  back16: colors.schedule.back16,
  back17: colors.schedule.back17,
  back18: colors.schedule.back18,
  back19: colors.schedule.back19,
  back20: colors.schedule.back20,
};

// Category icon mapping
const categoryIconMap: Record<CategoryIconType, string> = {
  computer: computerIcon,
  food: foodIcon,
  pencil: pencilIcon,
  redBook: redBookIcon,
  sleep: sleepIcon,
  power: powerIcon,
  people: peopleIcon,
  medicine: medicineIcon,
  talk: talkIcon,
  heart: heartIcon,
  vehicle: vehicleIcon,
  none: noneIcon,
};

const getCategoryIcon = (iconType?: CategoryIconType): string => {
  if (!iconType) return noneIcon;
  return categoryIconMap[iconType] || noneIcon;
};

export const SocialRoutineView: React.FC<SocialRoutineViewProps> = ({
  routine,
  onClick,
}) => {
  const bgColor =
    categoryBackgroundColors[routine.category] || colors.schedule.back1;
  const hasIcon = routine.categoryIcon && routine.categoryIcon !== "none";
  const hasMemo = routine.memo && routine.memo.trim() !== "";
  const hasTime = !!routine.time;
  const isTitleOnly = !hasMemo && !hasTime;

  // iOS SocialRoutineView container style - reduced size
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    cursor: onClick ? "pointer" : "default",
    overflow: "hidden",
    marginRight: "24px",
  };

  // iOS: categoryImageContainerView - reduced to 32x32
  const categoryIconContainerStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 12,
  };

  // iOS: categoryImage - reduced size
  const categoryIconStyle: React.CSSProperties = {
    width: 18,
    height: 18,
    objectFit: "contain",
  };

  // iOS: stackView - reduced padding, more padding when title only
  const contentStackStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginLeft: hasIcon ? 8 : 12,
    marginRight: 16,
    paddingTop: isTitleOnly ? 16 : 12,
    paddingBottom: isTitleOnly ? 16 : 12,
  };

  // iOS: routineTitleLabel - boldBody2, neutral800, max 2 lines
  const titleStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.boldBody2.fontWeight,
    color: colors.neutral[800],
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    lineHeight: 1.3,
  };

  // iOS: routineContentLabel (memo) - smaller font
  const memoStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption2.fontSize,
    fontWeight: typography.mediumCaption2.fontWeight,
    color: colors.neutral[600],
    margin: 0,
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  // iOS: dateContainerView - reduced height
  const timeContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: 16,
    gap: 3,
  };

  // iOS: timerImage - reduced size
  const clockIconStyle: React.CSSProperties = {
    width: 14,
    height: 14,
    opacity: 0.7,
  };

  // iOS: routineDateLabel - smaller font
  const timeTextStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption2.fontSize,
    fontWeight: typography.mediumCaption2.fontWeight,
    color: colors.neutral[600],
  };

  return (
    <div style={containerStyle} onClick={onClick}>
      {/* Category Icon Container - only show if icon exists */}
      {hasIcon && (
        <div style={categoryIconContainerStyle}>
          <img
            src={getCategoryIcon(routine.categoryIcon)}
            alt=""
            style={categoryIconStyle}
          />
        </div>
      )}

      {/* Content Stack */}
      <div style={contentStackStyle}>
        {/* Title */}
        <p style={titleStyle}>{routine.title}</p>

        {/* Memo (if exists) */}
        {hasMemo && <p style={memoStyle}>{routine.memo}</p>}

        {/* Time (if exists) */}
        {hasTime && (
          <div style={timeContainerStyle}>
            <img src={clockIcon} alt="" style={clockIconStyle} />
            <span style={timeTextStyle}>{routine.time}</span>
          </div>
        )}
      </div>
    </div>
  );
};
