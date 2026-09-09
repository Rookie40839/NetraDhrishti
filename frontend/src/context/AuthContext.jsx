import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('netradhrishti_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('netradhrishti_token'));
  const [loading, setLoading] = useState(false);

  // Seeded credentials for demo personas
  const DEMO_CREDENTIALS = {
    district: { email: 'do.pune@india.gov.in', password: 'demo123' },
    mp: { email: 'mp.pune@india.gov.in', password: 'demo123' },
    state: { email: 'admin.mh@india.gov.in', password: 'demo123' },
    mospi: { email: 'admin@mospi.gov.in', password: 'demo123' },
  };

  const FALLBACK_USERS = {
    district: {
      id: 2,
      name: 'Priya Singh',
      email: 'do.pune@india.gov.in',
      role: 'district_officer',
      districtId: 'Pune',
      stateId: 'Maharashtra',
      constituencyId: null,
    },
    mp: {
      id: 1,
      name: 'Ravi Kumar',
      email: 'mp.pune@india.gov.in',
      role: 'MP',
      constituencyId: 'Pune East',
      districtId: 'Pune',
      stateId: 'Maharashtra',
    },
    state: {
      id: 3,
      name: 'Amit Desai',
      email: 'admin.mh@india.gov.in',
      role: 'state_admin',
      districtId: null,
      stateId: 'Maharashtra',
      constituencyId: null,
    },
    mospi: {
      id: 4,
      name: 'Dr. S. Sharma',
      email: 'admin@mospi.gov.in',
      role: 'mospi_admin',
      districtId: null,
      stateId: null,
      constituencyId: null,
    },
  };

  const switchDemoRole = async (roleKey) => {
    setLoading(true);
    sessionStorage.removeItem('netradhrishti_logged_out');
    const creds = DEMO_CREDENTIALS[roleKey] || DEMO_CREDENTIALS.district;
    try {
      const res = await api.post('/auth/login', creds);
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('netradhrishti_token', jwtToken);
      localStorage.setItem('netradhrishti_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.warn('Backend login endpoint unavailable; applying offline demo persona:', err?.message);
      const selected = FALLBACK_USERS[roleKey] || FALLBACK_USERS.district;
      setUser(selected);
      localStorage.setItem('netradhrishti_user', JSON.stringify(selected));
      return { success: false, fallback: true, user: selected };
    } finally {
      setLoading(false);
    }
  };

  // Set default authenticated demo user on initial boot if not explicitly logged out
  useEffect(() => {
    const savedToken = localStorage.getItem('netradhrishti_token');
    const savedUser = localStorage.getItem('netradhrishti_user');
    const isLoggedOut = sessionStorage.getItem('netradhrishti_logged_out');

    if (!isLoggedOut && (!savedToken || !savedUser)) {
      switchDemoRole('district');
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    sessionStorage.removeItem('netradhrishti_logged_out');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('netradhrishti_token', jwtToken);
      localStorage.setItem('netradhrishti_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.setItem('netradhrishti_logged_out', 'true');
    setUser(null);
    setToken(null);
    localStorage.removeItem('netradhrishti_token');
    localStorage.removeItem('netradhrishti_user');
  };

  const getScopeLabel = () => {
    if (!user) return 'Public';
    if (user.role === 'MP') return `MP Scope (${user.constituencyId || 'Constituency'})`;
    if (user.role === 'district_officer') return `District Scope (${user.districtId || 'District'})`;
    if (user.role === 'state_admin') return `State Scope (${user.stateId || 'State'})`;
    return 'National Scope (MoSPI)';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchDemoRole, getScopeLabel }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
