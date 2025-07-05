import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data from backend
          const response = await axios.get('https://taskflow-wxqj.onrender.com/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load user profile');
        }
      } else {
        // Only clear user if not already logged in with JWT
        if (!localStorage.getItem('token')) {
          setUser(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('https://taskflow-wxqj.onrender.com/api/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Send token to backend for verification and user creation
      const response = await axios.post('https://taskflow-wxqj.onrender.com/api/auth/google', { token });
      
      if (response.data.success) {
        toast.success('Logged in successfully!');
        return true;
      }
    } catch (error) {
      console.error('Google login error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to login with Google');
      }
      return false;
    }
  };

  const loginWithEmail = async (email, password, isAdminLogin = false) => {
    try {
      const response = await axios.post('https://taskflow-wxqj.onrender.com/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Check if admin login is required but user is not admin
        if (isAdminLogin && userData.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          return false;
        }
        
        // Check if user is trying to access user portal but is admin
        if (!isAdminLogin && userData.role === 'admin') {
          toast.error('Admin accounts must use the Admin Portal.');
          return false;
        }
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        toast.success('Logged in successfully!');
        return true;
      }
    } catch (error) {
      console.error('Email login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('https://taskflow-wxqj.onrender.com/api/auth/register', userData);
      
      if (response.data.success) {
        toast.success(`${userData.role === 'admin' ? 'Admin' : 'User'} account created successfully!`);
        return true;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}