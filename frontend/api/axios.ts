import axios from 'axios';

console.log('url', process.env.NEXT_PUBLIC_API_URL)

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
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