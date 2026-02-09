import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

export const useRecommendations = () => {
    const queryClient = useQueryClient();

    const lastRecommendation = useQuery({
        queryKey: ["recommendations-latest"],
        queryFn: async () => {
            const response = await api.get("/recommendations/latest");
            return response.data;
        },
    });

    const generate = useQuery({
        queryKey: ["recommendations"],
        queryFn: async () => {
            const res = await api.get("/recommendations/generate");
            return JSON.parse(res.data); // Asumiendo que el backend envía el string de la IA
        },
        enabled: false,
    });

    return { lastRecommendation, generate };
};