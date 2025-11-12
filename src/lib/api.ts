export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export async function api<T = any>(path: string, options: { method?: HttpMethod; body?: any; auth?: boolean } = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
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



