// Emotion-based random phrases for diary writing - matching iOS app exactly
import { Emotion } from '../types';

type EmotionPhrases = Record<Emotion, string[]>;

// iOS app exact phrases from Emotion+Phrase.swift (with emojis)
export const emotionPhrases: EmotionPhrases = {
  happy: [
    '이 순간의 기쁨을 잊기 전에 기록해봐요!',
    '세상에! 최고로 기분 좋은 하루를 보내셨네요! 😆',
  ],
  good: [
    '행복한 하루를 보내셨네요! 저도 알려주실래요? 😊',
    '좋은 하루였다니 다행이에요! 오늘의 일상을 기록해봐요! 🥰',
  ],
  love: [
    '핑크빛 하루를 보내시다니!! 한번 자랑해보시죠?! 🤧',
    '두근두근! 하루를 기록하러 가볼까요? 🧡',
  ],
  soso: [
    '때로는 평범한 하루가 더 나을지도 몰라요 🙂',
    '무난한 하루! 어떤 일상을 보내셨나요?',
  ],
  sick: [
    '이런! 컨디션이 안좋으셨군요. 약은 드셨나요? 💊',
    '오늘은 조금만 기록하고 어서 쉬어요 🤒',
  ],
  sad: [
    '토닥토닥 🫂 어떤 슬픈일이 있으셨나요?',
    '괜찮아요. 울어도 돼요. 토닥이가 들어줄게요.',
  ],
  angry: [
    '화나는 일이 있었나요? 토닥이에게 같이 털어놓아요 🤬',
    '심호흡 하고 차분하게 오늘의 일을 작성해봐요',
  ],
  anxious: [
    '불안한 밤, 천천히 숨을 고르며 마음을 다독여 보세요',
    '어떤일이 당신을 불안하게 했나요? 😥',
  ],
  tired: [
    '오늘 하루도 고생했어요 😴',
    '피곤한 하루였나요? 푹 쉬고 내일 또 힘내요! 🫡',
  ],
};

export const getRandomPhrase = (emotion: Emotion): string => {
  const phrases = emotionPhrases[emotion];
  const randomIndex = Math.floor(Math.random() * phrases.length);
  return phrases[randomIndex];
};

// Completion screen phrases based on streak
export const streakPhrases: Record<string, string> = {
  start: '첫 걸음을 내딛었어요!',
  continuing: '꾸준히 기록하고 있어요!',
  week: '일주일 연속 기록 달성!',
  excellent: '짝짝짝! 아주 잘했어요!',
};

export const getStreakPhrase = (streak: number): string => {
  if (streak === 1) return streakPhrases.start;
  if (streak >= 7) return streakPhrases.week;
  if (streak >= 3) return streakPhrases.excellent;
  return streakPhrases.continuing;
};

// Diary content placeholders
export const diaryPlaceholders = {
  title: '오늘의 제목을 입력해주세요',
  memo: '오늘 하루를 기록해보세요',
  simpleMemo: '한 줄도 괜찮아요! 편하게 작성해봐요',
};
