import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔑 API Request:', config.method?.toUpperCase(), config.url, token ? 'Token present' : 'No token');

        if (token) {
            // Check if token is expired (basic check - decode JWT payload)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const now = Date.now() / 1000;
                console.log('🕒 Token check:', {
                    exp: payload.exp,
                    now: now,
                    expired: payload.exp < now
                });

                if (payload.exp < now) {
                    console.warn('⏰ Token expired, removing...');
                    Cookies.remove('token');
                    window.location.href = '/login';
                    return Promise.reject(new Error('Token expired'));
                }
            } catch (e) {
                console.warn('🚫 Invalid token format');
            }

            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.log('❌ API Error:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message,
            data: error.response?.data
        });

        // Handle 401 unauthorized errors, but not for login attempts or profile/user operations  
        if (error.response?.status === 401) {
            console.log('🔒 401 Error detected, checking URL:', error.config?.url);

            const isLoginRequest = error.config?.url?.includes('/auth/login');
            const isProfileRequest = error.config?.url?.includes('/auth/profile');
            const isPasswordRequest = error.config?.url?.includes('/auth/change-password');
            const isUserRequest = error.config?.url?.includes('/users/');

            console.log('🔍 Request type check:', {
                isLoginRequest,
                isProfileRequest,
                isPasswordRequest,
                isUserRequest
            });

            if (!isLoginRequest && !isProfileRequest && !isPasswordRequest && !isUserRequest) {
                console.warn('🚪 Unauthorized request, logging out...');
                Cookies.remove('token');
                window.location.href = '/login';
            } else {
                console.log('⚠️ 401 error but keeping user logged in (whitelisted request)');
            }
        }

        return Promise.reject(error);
    }
);// Auth API endpoints
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// User API endpoints
export const userAPI = {
    getUsers: (params) => api.get('/users', { params }),
    getUserById: (id) => api.get(`/users/${id}`),
    createUser: (formData) => api.post('/users', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),
    getRoles: () => api.get('/users/roles'),
    getPositions: () => api.get('/users/positions'),
};

// General API for health check
export const healthAPI = {
    check: () => api.get('/health'),
};

export default api;