import { apiClient } from './api';
import { AuthTokens, LoginRequest, QRLoginRequest } from '../types';

export const authService = {
  // Traditional login with ID and password
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // QR code based login (for web version)
  async qrLogin(data: QRLoginRequest): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/qr-login', data);
    return response.data;
  },

  // Generate QR code for login
  async generateQRCode(): Promise<{ qrToken: string; expiresAt: string }> {
    const response = await apiClient.get('/auth/qr-code');
    return response.data;
  },

  // Check QR code status (polling)
  async checkQRStatus(qrToken: string): Promise<{ status: 'pending' | 'scanned' | 'confirmed'; tokens?: AuthTokens }> {
    const response = await apiClient.get(`/auth/qr-status/${qrToken}`);
    return response.data;
  },

  // Refresh access token
  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },
};
