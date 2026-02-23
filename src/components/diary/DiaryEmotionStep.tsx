import React, { useState, useEffect } from "react";
import { colors } from "../../styles/colors";
import { typography } from "../../styles/typography";
import { TDLabel } from "../common/TDLabel";
import { TDButton } from "../common/TDButton";
import { emotions } from "./EmotionPicker";
import { Emotion } from "../../types";
import { getRandomPhrase } from "../../constants/diaryPhrases";

interface DiaryEmotionStepProps {
  selectedEmotion: Emotion | null;
  onSelectEmotion: (emotion: Emotion) => void;
  onOpenSimpleDiary: () => void;
}

export const DiaryEmotionStep: React.FC<DiaryEmotionStepProps> = ({
  selectedEmotion,
  onSelectEmotion,
  onOpenSimpleDiary,
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(
    selectedEmotion,
  );
  const [phrase, setPhrase] = useState<string>("");

  useEffect(() => {
    if (currentEmotion) {
      setPhrase(getRandomPhrase(currentEmotion));
    }
  }, [currentEmotion]);

  const handleEmotionSelect = (emotion: Emotion) => {
    setCurrentEmotion(emotion);
  };

  const handleNext = () => {
    if (currentEmotion) {
      onSelectEmotion(currentEmotion);
    }
  };

  // iOS exact styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "0 16px 28px", // iOS: bottom 28pt inset
  };

  // iOS: Label stack top 42pt from safe area
  const headerContainerStyle: React.CSSProperties = {
    textAlign: "center",
    paddingTop: 42,
    marginBottom: 8, // iOS: 8pt spacing between title and description
  };

  // Emotion grid - minimal padding for maximum emoji size
  const emotionGridContainerStyle: React.CSSProperties = {
    marginTop: 56,
    padding: "0 8px", // Minimal padding for larger emojis
    marginBottom: 24,
  };

  // iOS: 3x3 grid - centered with auto columns
  const emotionGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 96px)",
    gap: 8,
    justifyContent: "center",
  };

  // iOS: No button background, just emoji with alpha 0.3 for unselected (no label)
  const getEmotionButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 96,
    height: 96,
    padding: 0,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    opacity: isSelected || currentEmotion === null ? 1 : 0.3,
    transition: "opacity 0.2s ease",
  });

  // iOS: Emotion image size
  const emotionImageStyle: React.CSSProperties = {
    width: 80,
    height: 80,
    objectFit: "contain",
  };

  // iOS: Comment container - height 48pt, corner radius 16pt, neutral50 bg
  const phraseContainerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    minHeight: 48,
    padding: "0 16px", // iOS: 16pt horizontal inset
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginLeft: 24,
    marginRight: 24,
  };

  // iOS: Comment text - mediumHeader5, centered
  const phraseStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[600],
    textAlign: "center",
    lineHeight: 1.5,
    margin: 0,
  };

  // iOS: Footer with buttons - bottom 28pt inset, 16pt spacing between buttons
  const footerStyle: React.CSSProperties = {
    marginTop: "auto",
    paddingTop: 28,
  };

  // iOS: Simple diary button style
  const simpleDiaryButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    padding: "16px 0",
    cursor: "pointer",
    width: "100%",
    textAlign: "center",
    marginTop: 16, // iOS: 16pt spacing between buttons
  };

  const simpleDiaryTextStyle: React.CSSProperties = {
    fontSize: typography.mediumBody2.fontSize,
    fontWeight: typography.mediumBody2.fontWeight,
    color: colors.neutral[600],
    textDecoration: "underline",
  };

  return (
    <div style={containerStyle}>
      {/* Header - iOS: boldHeader4 title, boldBody2 description */}
      <div style={headerContainerStyle}>
        <TDLabel
          text="오늘의 기분은 어땠나요?"
          font="boldHeader4"
          color={colors.neutral[800]}
          style={{ display: "block", marginBottom: 8 }}
        />
        <TDLabel
          text="가장 가까운 감정 이모지를 선택해주세요"
          font="boldBody2"
          color={colors.neutral[600]}
        />
      </div>

      {/* Emotion Grid - iOS: 3x3 grid, 80pt from description, NO labels */}
      <div style={emotionGridContainerStyle}>
        <div style={emotionGridStyle}>
          {emotions.map((item) => {
            const isSelected = currentEmotion === item.emotion;
            return (
              <button
                key={item.emotion}
                onClick={() => handleEmotionSelect(item.emotion)}
                style={getEmotionButtonStyle(isSelected)}
              >
                <img
                  src={item.largeImage}
                  alt={item.label}
                  style={emotionImageStyle}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer - iOS: 56pt button height, bottom 28pt */}
      <div style={footerStyle}>
        {/* Phrase Container - right above button */}
        {currentEmotion && phrase && (
          <div style={phraseContainerStyle}>
            <p style={phraseStyle}>{phrase}</p>
          </div>
        )}
        <TDButton
          title="다음"
          onClick={handleNext}
          disabled={!currentEmotion}
          style={{ height: 56 }}
        />
        <button style={simpleDiaryButtonStyle} onClick={onOpenSimpleDiary}>
          <span style={simpleDiaryTextStyle}>심플 일기 작성</span>
        </button>
      </div>
    </div>
  );
};
