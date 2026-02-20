// src/services/authService.js
import api from './api';

class AuthService {
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials, false);
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response));
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            let endpoint = '/users/register';
            
            // Choose endpoint based on role
            if (userData.role === 'PATIENT') {
                endpoint = '/users/register/patient';
            } else if (userData.role === 'DOCTOR') {
                endpoint = '/users/register/doctor';
            } else if (userData.role === 'ADMIN') {
                endpoint = '/users/register/admin';
            }
            
            const response = await api.post(endpoint, userData, false);
            return response;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        const token = localStorage.getItem('token');
        if (token) {
            // Call logout endpoint
            api.post('/auth/logout', {}, true)
                .finally(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                });
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }
}

export default new AuthService();