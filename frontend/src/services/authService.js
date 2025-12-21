import httpClient from './httpClient';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';
import cookieUtils from '../utils/cookies';

export const authService = {
    // Register
    async register(userData) {
        console.log('Registering with URL:', `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`);
        console.log('User data:', userData);
        return httpClient.post(API_ENDPOINTS.REGISTER, userData, { skipAuth: true });
    },

    // Login
    async login(usernameOrEmail, password) {
        const response = await httpClient.post(API_ENDPOINTS.LOGIN, {
            login_identifier: usernameOrEmail,
            password
        }, { skipAuth: true });

        console.log('Login response:', response);

        // Backend returns: { code, success, message, data: { access_token, refresh_token } }
        const tokenData = response.data || response;

        if (tokenData.access_token) {
            // Save tokens to cookies (7 days expiration)
            cookieUtils.set('access_token', tokenData.access_token, 7);
            cookieUtils.set('refresh_token', tokenData.refresh_token, 7);
            console.log('Token saved to cookie:', cookieUtils.get('access_token')?.substring(0, 20) + '...');
        } else {
            console.error('No access_token in response:', response);
        }
        return response;
    },

    // Request OTP
    async requestOTP(email, purpose = 'registration') {
        return httpClient.post(API_ENDPOINTS.OTP_REQUEST, { email, purpose }, { skipAuth: true });
    },

    // Verify OTP
    async verifyOTP(email, otpCode, purpose = 'registration') {
        const response = await httpClient.post(API_ENDPOINTS.OTP_VERIFY, {
            email,
            otp_code: otpCode,
            purpose
        }, { skipAuth: true });
        return response;
    },

    // Forgot Password
    async forgotPassword(email) {
        return httpClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email }, { skipAuth: true });
    },

    // Reset Password
    async resetPassword(email, otpCode, newPassword) {
        return httpClient.post(API_ENDPOINTS.RESET_PASSWORD, {
            email,
            otp_code: otpCode,
            new_password: newPassword
        }, { skipAuth: true });
    },

    // Refresh Token
    async refreshToken(refreshToken) {
        return httpClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken });
    },

    // Logout
    logout() {
        cookieUtils.remove('access_token');
        cookieUtils.remove('refresh_token');
        localStorage.removeItem('user');
    }
};

export const userService = {
    // Get current user
    async getMe() {
        return httpClient.get(API_ENDPOINTS.GET_ME);
    },

    // Update profile
    async updateProfile(profileData) {
        return httpClient.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
    },

    // Deactivate account
    async deactivate() {
        return httpClient.post(API_ENDPOINTS.DEACTIVATE);
    }
};

export const dashboardService = {
    // Get dashboard data
    async getDashboard() {
        return httpClient.get(API_ENDPOINTS.DASHBOARD);
    }
};
