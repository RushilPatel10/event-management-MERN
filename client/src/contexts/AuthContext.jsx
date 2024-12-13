import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user: userData } = response.data;
            
            // Set token in localStorage
            localStorage.setItem('token', token);
            
            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update user state
            setUser(userData);
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        localStorage.clear();
        delete api.defaults.headers.common['Authorization'];
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 