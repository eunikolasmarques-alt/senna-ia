import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ClientAuthContext = createContext();

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ClientAuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('client_portal_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async (accessToken) => {
    try {
      const response = await axios.get(`${API_URL}/portal/validate/${accessToken}`);
      if (response.data.valid) {
        setClient(response.data.client);
        setToken(accessToken);
        localStorage.setItem('client_portal_token', accessToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (accessToken) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/portal/validate/${accessToken}`);
      if (response.data.valid) {
        setClient(response.data.client);
        setToken(accessToken);
        localStorage.setItem('client_portal_token', accessToken);
        return { success: true };
      }
      return { success: false, error: 'Token inválido' };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Token inválido ou expirado' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('client_portal_token');
    setToken(null);
    setClient(null);
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <ClientAuthContext.Provider value={{ 
      client, 
      token, 
      loading, 
      loginWithToken, 
      logout, 
      getAuthHeaders,
      isAuthenticated: !!client 
    }}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};
