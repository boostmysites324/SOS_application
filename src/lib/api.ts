import { CapacitorHttp, Capacitor } from '@capacitor/core';
import type { HttpResponse } from '@capacitor/core';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// API base URL - directly configured
const API_BASE = 'https://sos-backend-l46b.onrender.com';
console.log('[API] API_BASE configured:', API_BASE);

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export async function api<T = any>(path: string, options: { method?: HttpMethod; body?: any; auth?: boolean } = {}): Promise<T> {
  // Normalize path: ensure it starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;
  
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Use CapacitorHttp for native platforms (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const response: HttpResponse = await CapacitorHttp.request({
        method: options.method || 'GET',
        url: url,
        headers: headers,
        data: options.body,
      });

      if (response.status >= 400) {
        const err = response.data || {};
        const errorMsg = typeof err === 'object' && err.error ? err.error : `Request failed: ${response.status}`;
        console.error(`[API] Request failed: ${response.status}`, err);
        throw new Error(errorMsg);
      }
      
      return response.data as T;
    } catch (error: any) {
      // Handle network errors with better messages
      const errorMessage = error.message || String(error) || '';
      const errorString = errorMessage.toLowerCase();
      
      console.error('[API] Request error:', errorMessage, error);
      
      // DNS resolution errors (Android-specific patterns)
      if (errorString.includes('unable to resolve host') || 
          errorString.includes('no address associated with hostname') ||
          errorString.includes('enotfound') ||
          errorString.includes('getaddrinfo') ||
          errorString.includes('name or service not known') ||
          errorString.includes('host not found')) {
        throw new Error(
          `Cannot connect to server. Please check:\n` +
          `1. Your internet connection\n` +
          `2. The backend server is running\n` +
          `3. The API URL is correct: ${API_BASE}\n\n` +
          `If the problem persists, try:\n` +
          `- Restarting the app\n` +
          `- Checking your network settings\n` +
          `- Verifying the backend URL is accessible`
        );
      }
      
      // Connection timeout errors
      if (errorString.includes('timeout') || errorString.includes('timed out')) {
        throw new Error(
          'Connection timeout. The server may be down or unreachable.\n' +
          'If using Render free tier, the server may be sleeping. Please wait a moment and try again.'
        );
      }
      
      // SSL/Certificate errors
      if (errorString.includes('ssl') || errorString.includes('certificate') || errorString.includes('handshake')) {
        throw new Error('SSL certificate error. Please check your network security settings.');
      }
      
      // Connection refused errors
      if (errorString.includes('connection refused') || errorString.includes('econnrefused')) {
        throw new Error('Connection refused. The server may be down or not accepting connections.');
      }
      
      // Other network errors
      if (errorString.includes('network') || errorString.includes('connection')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // If error has a message, use it
      if (errorMessage) {
        throw error;
      }
      
      throw new Error('Network request failed. Please check your internet connection.');
    }
  } else {
    // Use standard fetch for web
    try {
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
      }
      return res.json();
    } catch (error: any) {
      // Handle network errors for web
      const errorMessage = error.message || '';
      
      // DNS resolution errors
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error(
          `Cannot connect to server. Please check:\n` +
          `1. Your internet connection\n` +
          `2. The backend server is running\n` +
          `3. The API URL is correct: ${API_BASE}`
        );
      }
      
      throw error;
    }
  }
}

export const Auth = {
  async login(identifier: string, password: string) {
    const body: any = { password };
    if (identifier.includes('@')) body.email = identifier; else body.employeeId = identifier;
    const data = await api<{ token: string; user: any }>(`/api/auth/login`, { method: 'POST', body });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    return data.user;
  },
  async register(email: string, password: string, name?: string, employeeId?: string) {
    const data = await api<any>(`/api/auth/register`, { method: 'POST', body: { email, password, name, employeeId } });
    
    // Only store token if it exists (email verification not required)
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    
    return data;
  },
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
  user() {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
};

export const Profile = {
  get: () => api(`/api/profile`, { auth: true }),
  update: (payload: { name?: string }) => api(`/api/profile`, { method: 'PUT', body: payload, auth: true }),
  // Emergency Contacts
  getEmergencyContacts: () => api(`/api/profile/emergency-contacts`, { auth: true }),
  createEmergencyContact: (data: { name: string; email?: string; phone?: string; relationship?: string; isPrimary?: boolean }) => 
    api(`/api/profile/emergency-contacts`, { method: 'POST', body: data, auth: true }),
  updateEmergencyContact: (id: string, data: any) => 
    api(`/api/profile/emergency-contacts/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteEmergencyContact: (id: string) => 
    api(`/api/profile/emergency-contacts/${id}`, { method: 'DELETE', auth: true }),
};

export const Notifications = {
  list: () => api(`/api/notifications`, { auth: true }),
  markRead: (id: string) => api(`/api/notifications/${id}/read`, { method: 'POST', auth: true }),
};

export const SOS = {
  start: (coords?: { latitude?: number; longitude?: number }) => api(`/api/sos/start`, { method: 'POST', body: coords, auth: true }),
  cancel: () => api(`/api/sos/cancel`, { method: 'POST', auth: true }),
  active: () => api(`/api/sos/active`, { auth: true }),
};

export const Admin = {
  // Users
  getUsers: () => api(`/api/admin/users`, { auth: true }),
  getUser: (id: string) => api(`/api/admin/users/${id}`, { auth: true }),
  updateUser: (id: string, data: any) => api(`/api/admin/users/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteUser: (id: string) => api(`/api/admin/users/${id}`, { method: 'DELETE', auth: true }),
  
  // SOS Alerts
  getSOSAlerts: (params?: { status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const queryString = query.toString();
    return api(`/api/admin/sos-alerts${queryString ? `?${queryString}` : ''}`, { auth: true });
  },
  getSOSAlert: (id: string) => api(`/api/admin/sos-alerts/${id}`, { auth: true }),
  resolveSOSAlert: (id: string) => api(`/api/admin/sos-alerts/${id}/resolve`, { method: 'POST', auth: true }),
  
  // Emergency Contacts
  getEmergencyContacts: () => api(`/api/admin/emergency-contacts`, { auth: true }),
  createEmergencyContact: (data: { name: string; email?: string; phone?: string; role: string }) => 
    api(`/api/admin/emergency-contacts`, { method: 'POST', body: data, auth: true }),
  updateEmergencyContact: (id: string, data: any) => 
    api(`/api/admin/emergency-contacts/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteEmergencyContact: (id: string) => 
    api(`/api/admin/emergency-contacts/${id}`, { method: 'DELETE', auth: true }),
  
  // Stats
  getStats: () => api(`/api/admin/stats`, { auth: true }),
};



