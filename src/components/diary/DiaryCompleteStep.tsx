import React from 'react';
import Lottie from 'lottie-react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { TDLabel } from '../common/TDLabel';
import { TDButton } from '../common/TDButton';
import { Emotion, DiaryStreakInfo } from '../../types';
import { getEmotionLottie } from './EmotionPicker';
import { Check } from 'lucide-react';

// Assets
import fireIcon from '../../assets/images/diary/complete/fire.png';

interface DiaryCompleteStepProps {
  emotion: Emotion;
  streakInfo: DiaryStreakInfo;
  onComplete: () => void;
}

export const DiaryCompleteStep: React.FC<DiaryCompleteStepProps> = ({
  emotion,
  streakInfo,
  onComplete,
}) => {
  const emotionLottie = getEmotionLottie(emotion);
  const streakCount = streakInfo.currentStreak;

  // ===== STYLES =====

  // iOS: Main container
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    backgroundColor: colors.baseWhite,
    position: 'relative',
    overflow: 'hidden',
  };

  // iOS: Top blur gradient circle (decorative background)
  const topBlurGradientStyle: React.CSSProperties = {
    position: 'absolute',
    top: -320,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '120%',
    aspectRatio: '1',
    background: `radial-gradient(circle, ${colors.primary[500]}40 0%, ${colors.primary[500]}00 70%)`,
    borderRadius: '50%',
    pointerEvents: 'none',
  };

  // iOS: Content container
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '0 16px',
    position: 'relative',
    zIndex: 1,
    flex: 1,
  };

  // iOS: Title - top 100pt, "연속 일기 작성 X일째"
  const titleContainerStyle: React.CSSProperties = {
    marginTop: 100,
    textAlign: 'center',
    marginBottom: 12,
  };

  // iOS: Description row with fire icon
  const descriptionRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 26,
  };

  // iOS: Fire icon 24x24
  const fireIconStyle: React.CSSProperties = {
    width: 24,
    height: 24,
  };

  // iOS: Lottie animation - 280x280
  const lottieContainerStyle: React.CSSProperties = {
    width: 280,
    height: 280,
    marginBottom: 28,
  };

  // iOS: Streak circles - spacing 6pt, circle size 30x30
  const streakContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    marginBottom: 0,
  };

  // iOS: Circle styles
  // - Unfilled: neutral100 bg, neutral400 border
  // - Filled (not last): primary500 bg, no border, check icon
  // - Filled (last): gradient bg, shadow, check icon, white border
  const getCircleStyle = (index: number): React.CSSProperties => {
    const isFilled = index < Math.min(streakCount, 7);
    const isLast = index === Math.min(streakCount, 7) - 1 && streakCount > 0;

    const baseStyle: React.CSSProperties = {
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (!isFilled) {
      return {
        ...baseStyle,
        backgroundColor: colors.neutral[100],
        border: `1px solid ${colors.neutral[400]}`,
      };
    }

    if (isLast) {
      // Last filled circle - gradient and shadow
      return {
        ...baseStyle,
        background: `linear-gradient(180deg, ${colors.primary[300]} 0%, ${colors.primary[500]} 100%)`,
        border: `1px solid ${colors.baseWhite}`,
        boxShadow: `0 0 16px ${colors.primary[500]}66`,
      };
    }

    // Filled but not last - solid primary
    return {
      ...baseStyle,
      backgroundColor: colors.primary[500],
      border: 'none',
    };
  };

  // iOS: Bottom section container (comment + button)
  const bottomSectionStyle: React.CSSProperties = {
    width: '100%',
    padding: '0 16px 28px',
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // iOS: Comment container - height 48pt, radius 16, neutral50 bg, fit content width
  const commentContainerStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    height: 48,
    padding: '0 16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  };

  return (
    <div style={containerStyle}>
      {/* iOS: Top blur gradient background */}
      <div style={topBlurGradientStyle} />

      <div style={contentStyle}>
        {/* iOS: Title - "연속 일기 작성 X일째" with X highlighted */}
        <div style={titleContainerStyle}>
          <span
            style={{
              fontSize: typography.boldHeader4.fontSize,
              fontWeight: typography.boldHeader4.fontWeight,
              color: colors.neutral[800],
            }}
          >
            연속 일기 작성{' '}
          </span>
          <span
            style={{
              fontSize: typography.boldHeader4.fontSize,
              fontWeight: typography.boldHeader4.fontWeight,
              color: colors.primary[500],
            }}
          >
            {streakCount}일째
          </span>
        </div>

        {/* iOS: Description with fire icon - boldHeader2 */}
        <div style={descriptionRowStyle}>
          <TDLabel
            text="기록 레벨이 올라가고 있어요"
            font="boldHeader2"
            color={colors.neutral[800]}
          />
          <img src={fireIcon} alt="" style={fireIconStyle} />
        </div>

        {/* iOS: Lottie Animation - 280x280 */}
        <div style={lottieContainerStyle}>
          {emotionLottie && (
            <Lottie
              animationData={emotionLottie}
              loop={true}
              autoplay={true}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* iOS: Streak Circles - 7 circles, 30x30, spacing 6pt */}
        <div style={streakContainerStyle}>
          {Array(7)
            .fill(null)
            .map((_, index) => {
              const isFilled = index < Math.min(streakCount, 7);
              return (
                <div key={index} style={getCircleStyle(index)}>
                  {isFilled && <Check size={18} color={colors.baseWhite} strokeWidth={3} />}
                </div>
              );
            })}
        </div>
      </div>

      {/* iOS: Bottom section - comment + button */}
      <div style={bottomSectionStyle}>
        {/* iOS: Comment - "짝짝짝 👏🏻 아주 잘했어요 !" */}
        <div style={commentContainerStyle}>
          <TDLabel
            text="짝짝짝 👏🏻 아주 잘했어요 !"
            font="mediumHeader5"
            color={colors.neutral[600]}
          />
        </div>

        {/* iOS: Button - height 56pt, full width, boldHeader3 font */}
        <TDButton
          title="작성한 일기 확인"
          onClick={onComplete}
          style={{ height: 56, width: '100%', fontSize: 18 }}
        />
      </div>
    </div>
  );
};
