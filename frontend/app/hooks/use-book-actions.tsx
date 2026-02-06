import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";
import { Book } from "./use-books";

export const useBookActions = () => {
    const queryClient = useQueryClient();

    // Buscar en la API (que a su vez busca en Google Books)
    const searchMutation = useMutation({
        mutationFn: async (title: string) => {
            const response = await api.get<{ book: Book }>(`/books/by-title?title=${title}`);
            return response.data;
        },
    });

    // Registrar la relación User-Book
    const addBookMutation = useMutation({
        mutationFn: async (bookData: Book) => {
            const response = await api.post("/books/by-title", null, {
                params: { title: bookData.title, author: bookData.author }
            });
            return response.data;
        },
        onSuccess: () => {
            // Refrescar la lista de la biblioteca automáticamente
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    const updateBookMutation = useMutation({
        mutationFn: async ({ userBookId, data }: { userBookId: number; data: any }) => {
            const response = await api.put(`/books/${userBookId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    return { searchMutation, addBookMutation, updateBookMutation };
};