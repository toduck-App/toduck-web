import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";
import { NavigationBar } from "../components/layout/NavigationBar";
import { TDButton } from "../components/common/TDButton";
import { TDLabel } from "../components/common/TDLabel";
import { TDAvatar } from "../components/common/TDAvatar";
import { useAuthStore } from "../store/authStore";
import { myPageService } from "../services/myPageService";
import { User } from "../types";

// Follow Info Component - "팔로잉 0" 형태로 가로 배치
const FollowInfo: React.FC<{ label: string; count: number }> = ({
  label,
  count,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    }}
  >
    <span
      style={{
        fontSize: typography.mediumCaption1.fontSize,
        fontWeight: typography.mediumCaption1.fontWeight,
        color: colors.neutral[600],
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: typography.boldBody3.fontSize,
        fontWeight: typography.boldBody3.fontWeight,
        color: colors.neutral[800],
      }}
    >
      {count}
    </span>
  </div>
);

export const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutModalAnimating, setLogoutModalAnimating] = useState(false);

  useEffect(() => {
    if (showLogoutConfirm) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setLogoutModalAnimating(true));
      });
    } else {
      setLogoutModalAnimating(false);
    }
  }, [showLogoutConfirm]);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileData, nicknameData] = await Promise.all([
        myPageService.fetchMyProfile().catch(() => null),
        myPageService.fetchNickname(),
      ]);
      if (profileData) {
        setUser(profileData);
      }
      setNickname(nicknameData || profileData?.nickname || "");
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayNickname = nickname || user?.nickname || "사용자";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "85vh",
    backgroundColor: colors.baseWhite,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  // Profile Section Style (iOS: 80px image, 12px vertical padding, 16px horizontal)
  const profileSectionStyle: React.CSSProperties = {
    padding: "12px 16px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.baseWhite,
  };

  const profileInfoStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const nicknameRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const followRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 24,
  };

  // Info Message Style
  const infoMessageStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: "24px 20px",
    textAlign: "center",
    maxWidth: 320,
    width: "100%",
  };

  // Footer Style
  const footerStyle: React.CSSProperties = {
    padding: "20px 16px",
    paddingBottom: 100,
    backgroundColor: colors.baseWhite,
  };

  const renderConfirmModal = () => {
    if (!showLogoutConfirm) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: logoutModalAnimating
            ? "rgba(0, 0, 0, 0.5)"
            : "rgba(0, 0, 0, 0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 24,
          transition: "background-color 0.25s ease",
        }}
        onClick={() => setShowLogoutConfirm(false)}
      >
        <div
          style={{
            backgroundColor: colors.baseWhite,
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: 320,
            transform: logoutModalAnimating ? "scale(1)" : "scale(0.9)",
            opacity: logoutModalAnimating ? 1 : 0,
            transition:
              "transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TDLabel
            text="로그아웃"
            font="boldHeader4"
            color={colors.neutral[800]}
            style={{ display: "block", textAlign: "center", marginBottom: 8 }}
          />
          <TDLabel
            text="정말 로그아웃 하시겠습니까?"
            font="mediumBody2"
            color={colors.neutral[600]}
            style={{ display: "block", textAlign: "center", marginBottom: 24 }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <TDButton
              title="취소"
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
              style={{ flex: 1 }}
            />
            <TDButton
              title="로그아웃"
              onClick={handleLogout}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <NavigationBar showLogo />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.neutral[500],
          }}
        >
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <NavigationBar showLogo />

      <div style={contentStyle}>
        {/* Profile Section */}
        <div style={profileSectionStyle}>
          <TDAvatar src={user?.profileImageUrl} size="large" />
          <div style={profileInfoStyle}>
            <div style={nicknameRowStyle}>
              <TDLabel
                text={displayNickname}
                font="boldHeader4"
                color={colors.neutral[800]}
              />
            </div>
            <div style={followRowStyle}>
              <FollowInfo label="팔로잉" count={user?.followingCount ?? 0} />
              <FollowInfo label="팔로워" count={user?.followerCount ?? 0} />
              <FollowInfo label="작성한 글" count={user?.postCount ?? 0} />
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div style={infoMessageStyle}>
          <div style={infoBoxStyle}>
            <div
              style={{
                fontSize: typography.mediumBody2.fontSize,
                fontWeight: typography.mediumBody2.fontWeight,
                color: colors.neutral[700],
                marginBottom: 8,
              }}
            >
              프로필 수정 및 계정 관리는
            </div>
            <div
              style={{
                fontSize: typography.mediumBody2.fontSize,
                fontWeight: typography.mediumBody2.fontWeight,
                color: colors.neutral[700],
              }}
            >
              <span style={{ color: colors.primary[500], fontWeight: 600 }}>
                모바일
              </span>
              에서 확인해주세요!
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={footerStyle}>
          <TDButton
            title="로그아웃"
            variant="outline"
            onClick={() => setShowLogoutConfirm(true)}
          />
        </div>
      </div>

      {renderConfirmModal()}
    </div>
  );
};
