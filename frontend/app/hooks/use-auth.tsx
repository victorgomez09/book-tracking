import { useMutation } from "@tanstack/react-query";
import { api } from "../api/axios";

export const useAuth = () => {
    // Mutación para Registro
    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/users/", data);
            return response.data;
        },
    });

    // Mutación para Login
    const loginMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // El login de FastAPI usa OAuth2 (Form Data)
            const response = await api.post("/users/login", formData);
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.access_token);
            window.location.href = "/dashboard"; // Redirección simple
        },
    });

    return { registerMutation, loginMutation };
};