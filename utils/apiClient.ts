import axios from 'axios';

// Get base URL from environment or use a default Polaris endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sirius.api.daniel-ai.com/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Project-Origin': 'Camus-Extramural',
        'X-Polaris-Version': '2.0',
    },
});

// Request Interceptor for Auth Tokens
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('polaris_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., redirect to login or clear token)
            console.warn('Unauthorized access - potential token expiration');
            localStorage.removeItem('polaris_token');
            localStorage.removeItem('authUser');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
