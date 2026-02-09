import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://refactored-eureka-g5wg45vqp9w3v69q-8000.app.github.dev', // Tu API de FastAPI
});

// Interceptor para meter el Token JWT automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Borrar token local si existe y redirigir
//             if (typeof window !== 'undefined') {
//                 localStorage.removeItem("token")
//                 if (window.location.href !== "/login")
//                     window.location.href = '/login';
//             }
//         }
//         return Promise.reject(error);
//     }
// );