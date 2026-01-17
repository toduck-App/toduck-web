import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';
import { TDButton } from '../components/common/TDButton';
import { TDLabel } from '../components/common/TDLabel';
import { TDToast } from '../components/common/TDToast';
import { useAuthStore } from '../store/authStore';
import { QrCode, RefreshCw, Smartphone, Settings } from 'lucide-react';

type QRStatus = 'generating' | 'pending' | 'scanned' | 'confirmed' | 'expired' | 'error';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const [qrStatus, setQrStatus] = useState<QRStatus>('generating');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Developer mode state
  const [showDevMode, setShowDevMode] = useState(false);
  const [devModeAnimating, setDevModeAnimating] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [devUserId, setDevUserId] = useState('');

  // Handle dev mode modal animation
  useEffect(() => {
    if (showDevMode) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDevModeAnimating(true));
      });
    } else {
      setDevModeAnimating(false);
    }
  }, [showDevMode]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/diary');
    }
  }, [isAuthenticated, navigate]);

  // Generate QR code on mount
  const generateQRCode = useCallback(async () => {
    setQrStatus('generating');
    try {
      // QR 로그인은 목업 - 백엔드 구현 후 연결
      const mockToken = `toduck-qr-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      setQrToken(mockToken);
      setQrStatus('pending');
    } catch (error) {
      setQrStatus('error');
      setToastMessage('QR 코드 생성에 실패했습니다.');
      setShowToast(true);
    }
  }, []);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // QR 만료 타이머
  useEffect(() => {
    if (!qrToken || qrStatus !== 'pending') return;

    const expiryTimeout = setTimeout(() => {
      setQrStatus('expired');
    }, 180000);

    return () => {
      clearTimeout(expiryTimeout);
    };
  }, [qrToken, qrStatus]);

  // 개발자 모드 토큰 로그인
  const handleDevLogin = () => {
    if (!devToken.trim()) {
      setToastMessage('토큰을 입력해주세요.');
      setShowToast(true);
      return;
    }

    if (!devUserId.trim()) {
      setToastMessage('User ID를 입력해주세요.');
      setShowToast(true);
      return;
    }

    const userId = parseInt(devUserId.trim(), 10);
    if (isNaN(userId)) {
      setToastMessage('User ID는 숫자여야 합니다.');
      setShowToast(true);
      return;
    }

    login(devToken.trim(), userId);
    navigate('/social');
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.baseWhite,
    padding: `0 ${layout.horizontalInset}px`,
  };

  const headerStyle: React.CSSProperties = {
    paddingTop: layout.titleTopOffset + 40,
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: layout.subtitleSpacing,
  };

  const logoIconStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 40,
  };

  const qrContainerStyle: React.CSSProperties = {
    width: 240,
    height: 240,
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    border: `1px solid ${colors.neutral[300]}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 24,
  };

  const qrPlaceholderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  };

  const statusBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: qrStatus === 'scanned' ? colors.semantic.success : colors.primary[500],
    color: colors.baseWhite,
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: typography.mediumCaption1.fontSize,
    fontWeight: typography.mediumCaption1.fontWeight,
  };

  const instructionContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  };

  const stepContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  };

  const stepNumberStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    color: colors.baseWhite,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.boldCaption1.fontSize,
    fontWeight: typography.boldCaption1.fontWeight,
    flexShrink: 0,
  };

  const devModeButtonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[200],
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const devModeModalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: devModeAnimating ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
    display: showDevMode ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
    transition: 'background-color 0.25s ease',
  };

  const devModeContentStyle: React.CSSProperties = {
    backgroundColor: colors.baseWhite,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    transform: devModeAnimating ? 'scale(1)' : 'scale(0.9)',
    opacity: devModeAnimating ? 1 : 0,
    transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    backgroundColor: colors.neutral[50],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
    boxSizing: 'border-box',
  };

  const renderQRContent = () => {
    switch (qrStatus) {
      case 'generating':
        return (
          <div style={qrPlaceholderStyle}>
            <RefreshCw size={48} color={colors.neutral[400]} className="spin" />
            <TDLabel text="QR 코드 생성 중..." font="mediumBody2" color={colors.neutral[600]} />
          </div>
        );
      case 'pending':
        return (
          <>
            <div style={statusBadgeStyle}>스캔 대기 중</div>
            <div style={qrPlaceholderStyle}>
              <QrCode size={160} color={colors.neutral[800]} strokeWidth={1} />
              {qrToken && (
                <div style={{ fontSize: 10, color: colors.neutral[500], textAlign: 'center' }}>
                  {qrToken.substring(0, 20)}...
                </div>
              )}
            </div>
          </>
        );
      case 'scanned':
        return (
          <>
            <div style={statusBadgeStyle}>앱에서 확인해주세요</div>
            <div style={qrPlaceholderStyle}>
              <Smartphone size={64} color={colors.semantic.success} />
              <TDLabel text="앱에서 로그인을 확인해주세요" font="mediumBody2" color={colors.neutral[700]} />
            </div>
          </>
        );
      case 'expired':
        return (
          <div style={qrPlaceholderStyle}>
            <QrCode size={64} color={colors.neutral[400]} />
            <TDLabel text="QR 코드가 만료되었습니다" font="mediumBody2" color={colors.neutral[600]} />
            <TDButton
              title="다시 생성"
              variant="secondary"
              size="medium"
              fullWidth={false}
              onClick={generateQRCode}
              style={{ padding: '8px 24px', marginTop: 8 }}
            />
          </div>
        );
      case 'error':
        return (
          <div style={qrPlaceholderStyle}>
            <QrCode size={64} color={colors.semantic.error} />
            <TDLabel text="오류가 발생했습니다" font="mediumBody2" color={colors.semantic.error} />
            <TDButton
              title="다시 시도"
              variant="secondary"
              size="medium"
              fullWidth={false}
              onClick={generateQRCode}
              style={{ padding: '8px 24px', marginTop: 8 }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoContainerStyle}>
          <div style={logoIconStyle}>🍅</div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: colors.primary[500],
            }}
          >
            toduck
          </span>
        </div>
        <TDLabel
          text="로그인"
          font="boldHeader2"
          color={colors.neutral[800]}
          style={{ display: 'block', marginBottom: layout.subtitleSpacing }}
        />
        <TDLabel
          text="토덕 앱으로 QR 코드를 스캔하여 로그인하세요."
          font="mediumHeader5"
          color={colors.neutral[600]}
        />
      </header>

      <div style={contentStyle}>
        <div style={qrContainerStyle}>{renderQRContent()}</div>

        <div style={instructionContainerStyle}>
          <TDLabel
            text="로그인 방법"
            font="boldBody2"
            color={colors.neutral[800]}
            style={{ alignSelf: 'flex-start', marginLeft: 16 }}
          />

          <div style={stepContainerStyle}>
            <div style={stepNumberStyle}>1</div>
            <TDLabel text="토덕 앱을 실행해주세요" font="mediumBody2" color={colors.neutral[700]} />
          </div>

          <div style={stepContainerStyle}>
            <div style={stepNumberStyle}>2</div>
            <TDLabel text="마이페이지 > QR 스캔을 선택해주세요" font="mediumBody2" color={colors.neutral[700]} />
          </div>

          <div style={stepContainerStyle}>
            <div style={stepNumberStyle}>3</div>
            <TDLabel text="화면의 QR 코드를 스캔해주세요" font="mediumBody2" color={colors.neutral[700]} />
          </div>
        </div>
      </div>

      {/* Developer Mode Button */}
      <button
        onClick={() => setShowDevMode(true)}
        style={devModeButtonStyle}
        title="개발자 모드"
      >
        <Settings size={24} color={colors.neutral[600]} />
      </button>

      {/* Developer Mode Modal */}
      <div style={devModeModalStyle} onClick={() => setShowDevMode(false)}>
        <div style={devModeContentStyle} onClick={(e) => e.stopPropagation()}>
          <TDLabel
            text="개발자 모드"
            font="boldHeader4"
            color={colors.neutral[800]}
            style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}
          />
          <TDLabel
            text="토큰을 직접 입력하여 로그인합니다."
            font="mediumBody2"
            color={colors.neutral[600]}
            style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
          />

          <input
            type="text"
            value={devToken}
            onChange={(e) => setDevToken(e.target.value)}
            placeholder="Access Token"
            style={inputStyle}
          />

          <input
            type="text"
            value={devUserId}
            onChange={(e) => setDevUserId(e.target.value)}
            placeholder="User ID"
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: 12 }}>
            <TDButton
              title="취소"
              variant="outline"
              onClick={() => setShowDevMode(false)}
              style={{ flex: 1 }}
            />
            <TDButton
              title="로그인"
              onClick={handleDevLogin}
              style={{ flex: 1 }}
            />
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
