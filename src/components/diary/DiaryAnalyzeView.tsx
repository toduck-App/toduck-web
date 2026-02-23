import React from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import bookIncrease from "../../assets/images/analyze/bookIncrease.png";
import bookDecrease from "../../assets/images/analyze/bookDecrease.png";
import bookZero from "../../assets/images/analyze/bookZero.png";
import focusZero from "../../assets/images/analyze/focusZero.png";
import focus1to20 from "../../assets/images/analyze/focus1to20.png";
import focus21to40 from "../../assets/images/analyze/focus21to40.png";
import focus41to70 from "../../assets/images/analyze/focus41to70.png";
import focus71to100 from "../../assets/images/analyze/focus71to100.png";

interface DiaryAnalyzeViewProps {
  nickname?: string;
  diaryCountDiff: number;
  focusPercent: number;
}

const getDiaryImage = (count: number) => {
  if (count > 0) return bookIncrease;
  if (count < 0) return bookDecrease;
  return bookZero;
};

const getFocusImage = (percent: number) => {
  if (percent === 0) return focusZero;
  if (percent <= 20) return focus1to20;
  if (percent <= 40) return focus21to40;
  if (percent <= 70) return focus41to70;
  return focus71to100;
};

export const DiaryAnalyzeView: React.FC<DiaryAnalyzeViewProps> = ({
  nickname,
  diaryCountDiff,
  focusPercent,
}) => {
  // iOS: 전체 높이 230px
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    height: 270,
    display: "flex",
    flexDirection: "column",
    paddingTop: 8,
  };

  // iOS: 닉네임 라벨 top 8, leading 24
  const titleRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
  };

  // iOS: 카드 스택 top 20 from titleLabel.bottom, leading/trailing 16, 높이 180, spacing 10
  const cardsContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 20,
    paddingLeft: 16,
    paddingRight: 16,
    height: 200,
  };

  // iOS: 카드 배경 white, borderRadius 12, padding 16
  const cardStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: colors.baseWhite,
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
  };

  // iOS: 카드 타이틀 mediumCaption1, neutral600, height 12
  const cardTitleStyle: React.CSSProperties = {
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.mediumCaption1.fontWeight,
    color: colors.neutral[600],
    height: 12,
    lineHeight: "12px",
  };

  // iOS: description1 boldHeader5, neutral800, height 24, top 4 from title
  const desc1Style: React.CSSProperties = {
    fontSize: typography.boldHeader5.fontSize,
    fontWeight: typography.boldHeader5.fontWeight,
    color: colors.neutral[800],
    height: 24,
    lineHeight: "24px",
    marginTop: 4,
  };

  // iOS: description2 boldHeader5, neutral800, height 24
  const desc2Style: React.CSSProperties = {
    fontSize: typography.boldHeader5.fontSize,
    fontWeight: typography.boldHeader5.fontWeight,
    color: colors.neutral[800],
    height: 24,
    lineHeight: "24px",
  };

  const highlightStyle: React.CSSProperties = {
    color: colors.primary[500],
  };

  // iOS: 이미지 컨테이너 top 12 from description2.bottom, 좌우 16, 높이 80
  const imageContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 12,
    paddingBottom: 0,
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: 80,
    objectFit: "contain",
  };

  // 일기 카드 내용 - iOS 로직과 동일하게
  const renderDiaryContent = () => {
    if (diaryCountDiff > 0) {
      return (
        <>
          <span style={desc1Style}>지난 달 보다</span>
          <span style={desc2Style}>
            <span style={highlightStyle}>{diaryCountDiff}일</span> 더 작성했어요
          </span>
        </>
      );
    }
    if (diaryCountDiff < 0) {
      return (
        <>
          <span style={desc1Style}>지난 달 보다</span>
          <span style={desc2Style}>일기 작성이 줄었어요</span>
        </>
      );
    }
    return (
      <>
        <span style={desc1Style}>지난 기록이 없어요..</span>
        <span style={desc2Style}>일기를 작성해봐요!</span>
      </>
    );
  };

  const displayName = nickname || "사용자";

  return (
    <div style={containerStyle}>
      {/* 타이틀 - iOS: boldHeader4 (18px, semibold) */}
      <div style={titleRowStyle}>
        <span
          style={{
            fontSize: typography.boldHeader4.fontSize,
            fontWeight: typography.boldHeader4.fontWeight,
            color: colors.neutral[800],
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            fontSize: typography.boldHeader4.fontSize,
            fontWeight: typography.boldHeader4.fontWeight,
            color: colors.neutral[700],
          }}
        >
          님을 분석해봤어요 !
        </span>
      </div>

      {/* 카드들 */}
      <div style={cardsContainerStyle}>
        {/* 기분 일기 카드 */}
        <div style={cardStyle}>
          <span style={cardTitleStyle}>기분 일기</span>
          {renderDiaryContent()}
          <div style={imageContainerStyle}>
            <img
              src={getDiaryImage(diaryCountDiff)}
              alt="diary analyze"
              style={imageStyle}
            />
          </div>
        </div>

        {/* 집중도 분석 카드 */}
        <div style={cardStyle}>
          <span style={cardTitleStyle}>집중도 분석</span>
          <span style={desc1Style}>이번 달 평균</span>
          <span style={desc2Style}>
            집중도는 <span style={highlightStyle}>{focusPercent}%</span> 에요
          </span>
          <div style={imageContainerStyle}>
            <img
              src={getFocusImage(focusPercent)}
              alt="focus analyze"
              style={imageStyle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
