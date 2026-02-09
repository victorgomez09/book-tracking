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

    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/recommendations/generate");
            return JSON.parse(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    return { lastRecommendation, generateMutation };
};