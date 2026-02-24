import API_BASE_URL from '../config/api';
import cookieUtils from '../utils/cookies';

class HttpClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    async request(endpoint, options = {}) {
        const token = cookieUtils.get('access_token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        const fullUrl = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(fullUrl, config);

            if (response.status === 401 && !options.skipRefresh && !options.skipAuth) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.request(endpoint, { ...options, skipRefresh: true });
                } else {
                    const publicPaths = ['/login', '/register', '/otp-verification', '/'];
                    const currentPath = window.location.pathname;

                    if (!publicPaths.includes(currentPath)) {
                        this.handleLogout();
                        throw new Error('Session expired. Please login again.');
                    }
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.detail || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async refreshToken() {
        try {
            const refreshToken = cookieUtils.get('refresh_token');
            if (!refreshToken) return false;

            const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (response.ok) {
                const responseData = await response.json();
                const tokenData = responseData.data || responseData;

                if (tokenData.access_token) {
                    cookieUtils.set('access_token', tokenData.access_token, 7);
                    if (tokenData.refresh_token) {
                        cookieUtils.set('refresh_token', tokenData.refresh_token, 7);
                    }
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Refresh token error:', error);
            return false;
        }
    }

    handleLogout() {
        cookieUtils.remove('access_token');
        cookieUtils.remove('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    }

    async put(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    }

    async patch(endpoint, data = {}, options = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            ...options
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    async upload(endpoint, formData, options = {}) {
        const token = cookieUtils.get('access_token');

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            if (response.status === 401 && !options.skipRefresh) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    return this.upload(endpoint, formData, { ...options, skipRefresh: true });
                } else {
                    this.handleLogout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

export default new HttpClient();
