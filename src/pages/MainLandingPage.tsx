import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { QrCode, HelpCircle, X, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";
import { useAuthStore } from "../store/authStore";

// Import assets
import loginBackground from "../assets/images/auth/loginBackground.png";
import toduckLogo from "../assets/images/logo/toduck_Primary_Logo.png";
import toduckOnboardingAnimation from "../assets/lottie/auth/toduckOnboarding.json";

// App Store URL (TODO: 실제 링크로 교체)
const APP_STORE_URL =
  "https://apps.apple.com/ph/app/%ED%86%A0%EB%8D%95-to-duck-%EC%84%B1%EC%9D%B8-adhd%EC%9D%B8%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%A0%EB%8B%A5%EC%9E%84/id6502951629";

const MOBILE_BREAKPOINT = 768;
const APP_CARD_WIDTH = 430;

// iOS AuthView.swift layout constants
const LAYOUT = {
  topOffset: 90,
  logoWidth: 160,
  logoHeight: 40,
  titleTopOffset: 18,
  loginButtonSideInset: 60,
  bottomOffset: 90,
} as const;

export const MainLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/social", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        backgroundColor: colors.baseWhite,
        zIndex: 50,
      }}
    >
      {/* 왼쪽: 앱 홍보 영역 (데스크탑만) */}
      {!isMobile && (
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 0 40px 40px",
            boxSizing: "border-box",
            maxWidth: 360,
            marginLeft: "auto",
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: colors.neutral[800],
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            ADHD 관리,
            <br />
            토덕과 함께해요!
          </p>
          <p
            style={{
              fontSize: typography.mediumBody1.fontSize,
              fontWeight: typography.mediumBody1.fontWeight,
              color: colors.neutral[600],
              marginBottom: 40,
              lineHeight: 1.6,
            }}
          >
            일기 · 루틴 관리 · 커뮤니티
          </p>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div
              style={{
                padding: "16px 16px 14px 16px",
                backgroundColor: colors.baseWhite,
                borderRadius: 16,
                border: `1px solid ${colors.neutral[200]}`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                flexShrink: 0,
              }}
            >
              <QRCodeSVG
                value={APP_STORE_URL}
                size={80}
                level="L"
                bgColor={colors.baseWhite}
                fgColor={colors.neutral[800]}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingTop: 8,

                marginBottom: 6,
              }}
            >
              <p
                style={{
                  fontSize: typography.boldBody1.fontSize,
                  fontWeight: typography.boldBody1.fontWeight,
                  color: colors.neutral[800],
                  lineHeight: 1.4,
                }}
              >
                아직이라면?
                <br />
                지금 바로 설치하기
              </p>
              <p
                style={{
                  fontSize: typography.mediumBody3.fontSize,
                  fontWeight: typography.mediumBody3.fontWeight,
                  color: colors.neutral[500],
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ArrowLeft size={14} />
                QR코드 스캔
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 오른쪽: 앱 카드 영역 */}
      <div
        style={{
          width: isMobile ? "100%" : APP_CARD_WIDTH,
          minWidth: isMobile ? undefined : APP_CARD_WIDTH,
          height: "100%",
          backgroundColor: colors.neutral[100],
          boxShadow: isMobile ? "none" : "-4px 0 24px rgba(0, 0, 0, 0.08)",
          position: "relative",
          overflow: "hidden",
          marginRight: "auto",
        }}
      >
        <img
          src={loginBackground}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            paddingTop: LAYOUT.topOffset,
            boxSizing: "border-box",
          }}
        >
          <img
            src={toduckLogo}
            alt="toduck"
            style={{
              width: LAYOUT.logoWidth,
              height: LAYOUT.logoHeight,
              objectFit: "contain",
            }}
          />

          <p
            style={{
              marginTop: LAYOUT.titleTopOffset,
              fontSize: typography.mediumBody3.fontSize,
              fontWeight: typography.mediumBody3.fontWeight,
              letterSpacing: typography.mediumBody3.letterSpacing,
              color: colors.primary[400],
              textAlign: "center",
            }}
          >
            ADHD 토덕과 함께 극복해요
          </p>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "20px 40px",
              boxSizing: "border-box",
            }}
          >
            <Lottie
              animationData={toduckOnboardingAnimation}
              loop={true}
              autoplay={true}
              style={{ width: "100%", maxWidth: 300, height: "auto" }}
            />
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 360,
              padding: "0 24px",
              paddingBottom: LAYOUT.bottomOffset,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <button
              onClick={handleLoginClick}
              style={{
                width: "100%",
                height: 52,
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
                color: colors.baseWhite,
                border: "none",
                borderRadius: 14,
                fontSize: typography.boldHeader5.fontSize,
                fontWeight: typography.boldHeader5.fontWeight,
                letterSpacing: typography.boldHeader5.letterSpacing,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: `0 4px 16px rgba(255, 114, 0, 0.35)`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(255, 114, 0, 0.45)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(255, 114, 0, 0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <QrCode size={20} />
              QR코드로 로그인
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <p
                style={{
                  fontSize: typography.mediumBody3.fontSize,
                  fontWeight: typography.mediumBody3.fontWeight,
                  color: colors.neutral[600],
                  textAlign: "center",
                }}
              >
                토덕 앱으로 로그인할 수 있어요
              </p>
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={toggleTooltip}
                aria-label="로그인 안내"
              >
                <HelpCircle size={13} color={colors.neutral[500]} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Modal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: showTooltip ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: 24,
        }}
        onClick={() => setShowTooltip(false)}
      >
        <div
          style={{
            backgroundColor: colors.baseWhite,
            borderRadius: 16,
            padding: 24,
            maxWidth: 300,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowTooltip(false)}
            aria-label="닫기"
          >
            <X size={20} color={colors.neutral[500]} />
          </button>
          <p
            style={{
              fontSize: typography.boldBody1.fontSize,
              fontWeight: typography.boldBody1.fontWeight,
              color: colors.neutral[800],
              marginBottom: 12,
            }}
          >
            웹 로그인 안내
          </p>
          <p
            style={{
              fontSize: typography.regularBody2.fontSize,
              fontWeight: typography.regularBody2.fontWeight,
              color: colors.neutral[600],
              lineHeight: 1.5,
            }}
          >
            토덕 웹은 모바일 앱을 통해서만 로그인할 수 있어요.
            <br />
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};
