import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";

export interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    image_url: string;
    page_count: number;
    current_page: number;
    progress: number;
    rating: number;
    notes: string;
    tags: string;
    status: string;
}

export const useBooks = () => {
    return useQuery<Book[]>({
        queryKey: ["books"],
        queryFn: async () => {
            const response = await api.get("/books/find-all");
            return response.data;
        },
    });
};