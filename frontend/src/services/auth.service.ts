import api from './api';
import type { LoginCredentials, RegisterData, ApiResponse, User, AuthTokens } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.tokens) {
      this.setTokens(response.data.data.tokens);
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await api.post('/auth/register', data);
    if (response.data.data.tokens) {
      this.setTokens(response.data.data.tokens);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.data.tokens) {
      this.setTokens(response.data.data.tokens);
    }
    return response.data;
  }

  private setTokens(tokens: AuthTokens) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getStoredTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
    
    return null;
  }
}

export default new AuthService();