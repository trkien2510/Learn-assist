import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/authService';
import cookieUtils from '../utils/cookies';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = cookieUtils.get('access_token');

      if (token) {
        try {
          // Verify token by fetching user data
          const response = await userService.getMe();
          const userData = response.data || response; // Extract data field
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Auth init error:', error);
          // Token invalid, clear storage silently (no redirect)
          cookieUtils.remove('access_token');
          cookieUtils.remove('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await authService.login(usernameOrEmail, password);

      // Fetch user data after login
      const response2 = await userService.getMe();
      const userData = response2.data || response2; // Extract data field
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      // After registration, user needs to verify OTP
      // Don't auto-login, return success
      return { success: true, needsVerification: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const verifyOTP = async (email, otpCode, purpose = 'registration') => {
    try {
      const response = await authService.verifyOTP(email, otpCode, purpose);

      // After OTP verification for registration, auto-login
      const tokenData = response.data || response;

      if (purpose === 'registration' && tokenData.access_token) {
        cookieUtils.set('access_token', tokenData.access_token, 7);
        cookieUtils.set('refresh_token', tokenData.refresh_token, 7);

        const response2 = await userService.getMe();
        const userData = response2.data || response2; // Extract data field
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  };

  const requestOTP = async (email, purpose = 'registration') => {
    try {
      return await authService.requestOTP(email, purpose);
    } catch (error) {
      console.error('Request OTP error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  const updateUser = async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      verifyOTP,
      requestOTP,
      logout,
      hasRole,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
