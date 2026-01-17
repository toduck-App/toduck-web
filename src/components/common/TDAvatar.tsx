import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import defaultProfileSmall from '../../assets/images/profile/profile_Small.png';
import defaultProfileMedium from '../../assets/images/profile/profile_Medium.png';
import defaultProfileLarge from '../../assets/images/profile/profile_Large.png';

interface TDAvatarProps {
  src?: string;
  size?: 'small' | 'medium' | 'large';
  alt?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const sizeMap = {
  small: 36,
  medium: 48,
  large: 80,
};

const defaultImageMap = {
  small: defaultProfileSmall,
  medium: defaultProfileMedium,
  large: defaultProfileLarge,
};

export const TDAvatar: React.FC<TDAvatarProps> = ({
  src,
  size = 'medium',
  alt = 'avatar',
  style,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const dimension = sizeMap[size];
  const defaultImage = defaultImageMap[size];

  const containerStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const handleError = () => {
    setHasError(true);
  };

  const imageSrc = hasError || !src ? defaultImage : src;

  return (
    <div style={containerStyle} onClick={onClick}>
      <img
        src={imageSrc}
        alt={alt}
        style={imageStyle}
        onError={handleError}
      />
    </div>
  );
};
