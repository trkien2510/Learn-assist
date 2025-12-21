import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const dashboardService = {
    // Get dashboard data based on role
    async getDashboard() {
        return httpClient.get(API_ENDPOINTS.DASHBOARD);
    }
};

export default dashboardService;
