import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

export const useAuth = () => {
    const queryClient = useQueryClient();
    
    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/users/", data);
            return response.data;
        },
    });

    const loginMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            // El login de FastAPI usa OAuth2 (Form Data)
            const response = await api.post("/users/login", formData);
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.access_token);
            window.location.href = "/library"; // Redirección simple
        },
    });

    const logout = async () => {
        queryClient.setQueryData(["user-me"], null);
        window.location.href = "/login";
    };

    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ["user-me"],
        queryFn: async () => {
            const response = await api.get("/users/me");
            return response.data;
        },
        retry: false, // Si da 401, no reintentar
        staleTime: 1000 * 60 * 5, // Cachear 5 minutos
    });

    return { registerMutation, loginMutation, isAuthenticated: !!user, user, isError, isLoading, error, logout };
};