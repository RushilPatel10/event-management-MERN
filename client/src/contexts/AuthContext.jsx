import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout,
            checkAuthStatus 
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 