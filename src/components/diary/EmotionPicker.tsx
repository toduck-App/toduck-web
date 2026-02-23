import React from 'react';
import Lottie from 'lottie-react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { Emotion } from '../../types';

// Import Lottie animations
import happyAnimation from '../../assets/lottie/diary/happy.json';
import goodAnimation from '../../assets/lottie/diary/good.json';
import loveAnimation from '../../assets/lottie/diary/love.json';
import sosoAnimation from '../../assets/lottie/diary/soso.json';
import sickAnimation from '../../assets/lottie/diary/sick.json';
import sadAnimation from '../../assets/lottie/diary/sad.json';
import angryAnimation from '../../assets/lottie/diary/angry.json';
import anxietyAnimation from '../../assets/lottie/diary/anxiety.json';
import tiredAnimation from '../../assets/lottie/diary/tired.json';

// Import mood images
import happyMood from '../../assets/images/mood/happy_Mood.png';
import goodMood from '../../assets/images/mood/good_Mood.png';
import loveMood from '../../assets/images/mood/love_Mood.png';
import sosoMood from '../../assets/images/mood/soso_Mood.png';
import sickMood from '../../assets/images/mood/sick_Mood.png';
import sadMood from '../../assets/images/mood/sad_Mood.png';
import angryMood from '../../assets/images/mood/angry_Mood.png';
import anxiousMood from '../../assets/images/mood/anxious_Mood.png';
import tiredMood from '../../assets/images/mood/tired_Mood.png';

// Import large mood images (for DiaryEmotionStep)
import largeHappy from '../../assets/images/mood/largeHappy.png';
import largeGood from '../../assets/images/mood/largeGood.png';
import largeLove from '../../assets/images/mood/largeLove.png';
import largeSoso from '../../assets/images/mood/largeSoso.png';
import largeSick from '../../assets/images/mood/largeSick.png';
import largeSad from '../../assets/images/mood/largeSad.png';
import largeAngry from '../../assets/images/mood/largeAngry.png';
import largeAnxious from '../../assets/images/mood/largeAnxious.png';
import largeTired from '../../assets/images/mood/largeTired.png';

interface EmotionItem {
  emotion: Emotion;
  label: string;
  color: string;
  lottie: object;
  image: string;
  largeImage: string;
}

const emotions: EmotionItem[] = [
  { emotion: 'happy', label: '행복해요', color: colors.diary.happy, lottie: happyAnimation, image: happyMood, largeImage: largeHappy },
  { emotion: 'good', label: '좋아요', color: colors.diary.good, lottie: goodAnimation, image: goodMood, largeImage: largeGood },
  { emotion: 'love', label: '설레요', color: colors.diary.love, lottie: loveAnimation, image: loveMood, largeImage: largeLove },
  { emotion: 'soso', label: '그냥 그래요', color: colors.diary.soso, lottie: sosoAnimation, image: sosoMood, largeImage: largeSoso },
  { emotion: 'sick', label: '아파요', color: colors.diary.sick, lottie: sickAnimation, image: sickMood, largeImage: largeSick },
  { emotion: 'sad', label: '슬퍼요', color: colors.diary.sad, lottie: sadAnimation, image: sadMood, largeImage: largeSad },
  { emotion: 'angry', label: '화나요', color: colors.diary.angry, lottie: angryAnimation, image: angryMood, largeImage: largeAngry },
  { emotion: 'anxious', label: '불안해요', color: colors.diary.anxiety, lottie: anxietyAnimation, image: anxiousMood, largeImage: largeAnxious },
  { emotion: 'tired', label: '피곤해요', color: colors.diary.tired, lottie: tiredAnimation, image: tiredMood, largeImage: largeTired },
];

interface EmotionPickerProps {
  selectedEmotion: Emotion | null;
  onSelectEmotion: (emotion: Emotion) => void;
  useLottie?: boolean;
}

export const EmotionPicker: React.FC<EmotionPickerProps> = ({
  selectedEmotion,
  onSelectEmotion,
  useLottie = true,
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    padding: 16,
  };

  const getItemStyle = (isSelected: boolean, bgColor: string): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: isSelected ? bgColor : colors.neutral[50],
    borderRadius: 16,
    border: isSelected ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.neutral[200]}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
  });

  const animationContainerStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    marginBottom: 8,
  };

  const labelStyle = (isSelected: boolean): React.CSSProperties => ({
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: isSelected ? typography.boldCaption1.fontWeight : typography.mediumCaption1.fontWeight,
    color: colors.neutral[800],
    textAlign: 'center',
  });

  return (
    <div style={containerStyle}>
      {emotions.map((item) => {
        const isSelected = selectedEmotion === item.emotion;
        return (
          <button
            key={item.emotion}
            onClick={() => onSelectEmotion(item.emotion)}
            style={getItemStyle(isSelected, item.color)}
          >
            <div style={animationContainerStyle}>
              {useLottie ? (
                <Lottie
                  animationData={item.lottie}
                  loop={isSelected}
                  autoplay={isSelected}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.label}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            <span style={labelStyle(isSelected)}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Export emotion info for use elsewhere
export const getEmotionInfo = (emotion: Emotion): EmotionItem | undefined => {
  return emotions.find((e) => e.emotion === emotion);
};

export const getEmotionLottie = (emotion: Emotion): object | undefined => {
  return emotions.find((e) => e.emotion === emotion)?.lottie;
};

export const getEmotionImage = (emotion: Emotion): string | undefined => {
  return emotions.find((e) => e.emotion === emotion)?.image;
};

export const getEmotionLargeImage = (emotion: Emotion): string | undefined => {
  return emotions.find((e) => e.emotion === emotion)?.largeImage;
};

export { emotions };
