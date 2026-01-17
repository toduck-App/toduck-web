import React from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { layout } from '../../styles/layout';
import { User } from '../../types';
import { TDAvatar } from '../common/TDAvatar';
import { TDLabel } from '../common/TDLabel';

interface MyPageProfileViewProps {
  user: User;
}

interface FollowInfoProps {
  label: string;
  count: number;
}

const FollowInfo: React.FC<FollowInfoProps> = ({ label, count }) => (
  <div style={{ textAlign: 'center' }}>
    <div
      style={{
        fontSize: typography.boldBody3.fontSize,
        fontWeight: typography.boldBody3.fontWeight,
        color: colors.neutral[800],
      }}
    >
      {count}
    </div>
    <div
      style={{
        fontSize: typography.mediumCaption1.fontSize,
        fontWeight: typography.mediumCaption1.fontWeight,
        color: colors.neutral[600],
        marginTop: 2,
      }}
    >
      {label}
    </div>
  </div>
);

export const MyPageProfileView: React.FC<MyPageProfileViewProps> = ({ user }) => {
  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    padding: `${layout.myPage.profileImageSize / 5}px ${layout.containerHorizontalPadding}px`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  };

  const infoContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const userRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const followRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  };

  return (
    <div style={containerStyle}>
      <TDAvatar src={user.profileImageUrl} size="large" />

      <div style={infoContainerStyle}>
        <div style={userRowStyle}>
          <TDLabel
            text={user.nickname}
            font="boldHeader4"
            color={colors.neutral[800]}
          />
          {user.title && (
            <span
              style={{
                padding: '2px 8px',
                backgroundColor: colors.primary[100],
                borderRadius: 4,
                fontSize: typography.mediumCaption2.fontSize,
                fontWeight: typography.mediumCaption2.fontWeight,
                color: colors.primary[600],
              }}
            >
              {user.title}
            </span>
          )}
        </div>

        <div style={followRowStyle}>
          <FollowInfo label="팔로잉" count={user.followingCount} />
          <FollowInfo label="팔로워" count={user.followerCount} />
          <FollowInfo label="작성한 글" count={user.postCount} />
        </div>
      </div>
    </div>
  );
};
