import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, CheckCircle, ChevronLeft } from "lucide-react";
import { colors } from "../styles/colors";
import { typography } from "../styles/typography";
import { TDLabel } from "../components/common/TDLabel";
import { TDToast } from "../components/common/TDToast";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { WebSessionStatus } from "../types";

const POLLING_INTERVAL = 1000;
const QR_SIZE = 200;
const APP_CARD_WIDTH = 430;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [qrImageBase64, setQrImageBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<WebSessionStatus | "LOADING" | "ERROR">(
    "LOADING",
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const createSession = useCallback(async () => {
    setStatus("LOADING");
    setQrImageBase64(null);
    setSessionToken(null);

    try {
      const response = await authService.createWebSession();
      if (!isMountedRef.current) return;

      setSessionToken(response.sessionToken);
      setQrImageBase64(response.qrImageBase64);
      setStatus("PENDING");
    } catch {
      if (!isMountedRef.current) return;
      setStatus("ERROR");
      setToastMessage("QR 코드 생성에 실패했습니다.");
      setShowToast(true);
    }
  }, []);

  const checkSessionStatus = useCallback(async () => {
    if (!sessionToken || !isMountedRef.current) return;

    try {
      const response = await authService.checkWebSessionStatus(sessionToken);
      if (!isMountedRef.current) return;

      if (
        response.status === "APPROVED" &&
        response.accessToken &&
        response.userId
      ) {
        setStatus("APPROVED");
        login(response.accessToken, response.userId);
        navigate("/social", { replace: true });
        return;
      }

      if (response.status === "EXPIRED") {
        setStatus("EXPIRED");
        return;
      }
    } catch {
      // 에러 시 다음 폴링에서 재시도
    }
  }, [sessionToken, login, navigate]);

  useEffect(() => {
    isMountedRef.current = true;
    createSession();

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [createSession]);

  useEffect(() => {
    if (status === "PENDING" && sessionToken) {
      const poll = async () => {
        await checkSessionStatus();
        if (isMountedRef.current && status === "PENDING") {
          pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
        }
      };
      pollingRef.current = setTimeout(poll, POLLING_INTERVAL);
    }

    if (status === "EXPIRED") {
      createSession();
    }

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [status, sessionToken, checkSessionStatus, createSession]);

  const renderQRContent = () => {
    if (status === "LOADING") {
      return (
        <div style={qrPlaceholderStyle}>
          <RefreshCw size={36} color={colors.primary[400]} className="spin" />
        </div>
      );
    }

    if (status === "ERROR") {
      return (
        <div style={qrPlaceholderStyle}>
          <TDLabel
            text="오류 발생"
            font="mediumBody3"
            color={colors.semantic.error}
          />
          <button
            onClick={createSession}
            style={{
              marginTop: 8,
              padding: "8px 16px",
              backgroundColor: colors.neutral[100],
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: typography.mediumBody3.fontSize,
              color: colors.neutral[700],
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (status === "APPROVED") {
      return (
        <div style={qrPlaceholderStyle}>
          <CheckCircle size={48} color={colors.semantic.success} />
        </div>
      );
    }

    if (status === "PENDING" && qrImageBase64) {
      return (
        <img
          src={qrImageBase64}
          alt="QR 코드"
          style={{
            width: QR_SIZE,
            height: QR_SIZE,
            objectFit: "contain",
          }}
        />
      );
    }

    return null;
  };

  const qrPlaceholderStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: QR_SIZE,
    height: QR_SIZE,
  };

  const cameraSteps = [
    "휴대전화에서 카메라 앱을 열어요.",
    "카메라로 코드를 스캔해요.",
    "토덕 로그인하기 팝업을 클릭해요.",
  ];

  const appSteps = [
    "휴대전화에서 토덕 앱을 열어요.",
    "마이페이지 > 계정 관리 > QR 코드 스캔을 선택해요.",
    "스캐너로 코드를 스캔해요.",
    "토덕 로그인하기 팝업을 선택해요.",
  ];

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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.baseWhite,
        overflow: "hidden",
      }}
    >
      {/* 앱 카드 영역 */}
      <div
        style={{
          width: "100%",
          maxWidth: APP_CARD_WIDTH,
          height: "100%",
          backgroundColor: colors.baseWhite,
          boxShadow: "0 0 24px rgba(0, 0, 0, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            width: 44,
            height: 44,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          aria-label="뒤로가기"
        >
          <ChevronLeft size={28} color={colors.neutral[800]} />
        </button>

        {/* 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            paddingTop: 70,
            paddingLeft: 24,
            paddingRight: 24,
            boxSizing: "border-box",
          }}
        >
          {/* 타이틀 섹션 */}
          <div style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: colors.neutral[900],
                marginBottom: 8,
              }}
            >
              QR코드로 로그인
            </h1>
            <p
              style={{
                fontSize: typography.mediumBody2.fontSize,
                fontWeight: typography.mediumBody2.fontWeight,
                color: colors.neutral[500],
                lineHeight: 1.5,
              }}
            >
              휴대전화의 카메라 또는 토덕 앱으로 QR코드를 촬영해주세요.
            </p>
          </div>

          {/* QR 코드 섹션 */}
          <div>
            {/* QR 코드 */}
            <div
              style={{
                backgroundColor: colors.neutral[100],
                borderRadius: 16,
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {renderQRContent()}
            </div>
            {/* 휴대전화 카메라 섹션 */}
            <p
              style={{
                fontSize: typography.boldBody2.fontSize,
                fontWeight: typography.boldBody2.fontWeight,
                color: colors.neutral[800],
                marginBottom: 12,
                marginTop: 40,
              }}
            >
              휴대전화로 QR 코드 촬영하기
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 28,
              }}
            >
              {cameraSteps.map((step, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: typography.mediumBody3.fontSize,
                    fontWeight: typography.mediumBody3.fontWeight,
                    color: colors.neutral[600],
                    lineHeight: 1.5,
                  }}
                >
                  {index + 1}. {step}
                </p>
              ))}
            </div>

            {/* 토덕 앱 섹션 */}
            <p
              style={{
                fontSize: typography.boldBody2.fontSize,
                fontWeight: typography.boldBody2.fontWeight,
                color: colors.neutral[800],
                marginBottom: 12,
              }}
            >
              토덕 앱으로 QR 코드 촬영하기
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {appSteps.map((step, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: typography.mediumBody3.fontSize,
                    fontWeight: typography.mediumBody3.fontWeight,
                    color: colors.neutral[600],
                    lineHeight: 1.5,
                  }}
                >
                  {index + 1}. {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TDToast
        message={toastMessage}
        type="error"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
