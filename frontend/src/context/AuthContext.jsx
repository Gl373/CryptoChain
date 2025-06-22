import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ username: decoded.username, role: decoded.role });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      const { data } = await response.json();
      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);
      setUser({ username: decoded.username, role: decoded.role });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const register = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};