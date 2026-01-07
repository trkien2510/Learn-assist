import httpClient from './httpClient';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';
import cookieUtils from '../utils/cookies';

export const authService = {
    async register(userData) {

        return httpClient.post(API_ENDPOINTS.REGISTER, userData, { skipAuth: true });
    },

    async login(usernameOrEmail, password) {
        const response = await httpClient.post(API_ENDPOINTS.LOGIN, {
            login_identifier: usernameOrEmail,
            password
        }, { skipAuth: true });



        const tokenData = response.data || response;

        if (tokenData.access_token) {
            cookieUtils.set('access_token', tokenData.access_token, 7);
            cookieUtils.set('refresh_token', tokenData.refresh_token, 7);

        } else {
            console.error('No access_token in response:', response);
        }
        return response;
    },

    async requestOTP(email, purpose = 'registration') {
        return httpClient.post(API_ENDPOINTS.OTP_REQUEST, { email, purpose }, { skipAuth: true });
    },

    async verifyOTP(email, otpCode, purpose = 'registration') {
        const response = await httpClient.post(API_ENDPOINTS.OTP_VERIFY, {
            email,
            otp_code: otpCode,
            purpose
        }, { skipAuth: true });
        return response;
    },

    async forgotPassword(email) {
        return httpClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email }, { skipAuth: true });
    },

    async resetPassword(email, otpCode, newPassword, confirmPassword) {
        return httpClient.post(API_ENDPOINTS.RESET_PASSWORD, {
            email,
            otp_code: otpCode,
            new_password: newPassword,
            confirm_password: confirmPassword
        }, { skipAuth: true });
    },

    async refreshToken(refreshToken) {
        return httpClient.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken });
    },

    logout() {
        cookieUtils.remove('access_token');
        cookieUtils.remove('refresh_token');
        localStorage.removeItem('user');
    }
};

export const userService = {
    async getMe() {
        return httpClient.get(API_ENDPOINTS.GET_ME);
    },

    async updateProfile(profileData) {
        return httpClient.put(API_ENDPOINTS.UPDATE_PROFILE, profileData);
    },

    async changePassword(passwordData) {
        return httpClient.post(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
    },

    async deleteAccount(data) {
        return httpClient.delete(API_ENDPOINTS.DELETE_ACCOUNT, {
            body: JSON.stringify(data)
        });
    }
};
