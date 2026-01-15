import axios from 'axios';

// Determine API base URL dynamically for network access
const getBaseURL = () => {
    const hostname = window.location.hostname;
    // Use the same hostname as the frontend, but connect to backend port
    return `http://${hostname}:5000/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Include credentials in cross-origin requests
});

// Add a request interceptor to attach the token and handle Content-Type
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData - let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
