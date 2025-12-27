import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/api';

export const dashboardService = {
    async getDashboard() {
        return httpClient.get(API_ENDPOINTS.DASHBOARD);
    }
};

export default dashboardService;
