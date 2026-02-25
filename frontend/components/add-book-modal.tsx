"use client";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useBookActions } from "../hooks/use-book-actions";
import { Book } from "../hooks/use-books";

type SearchForm = {
    title: string;
    author: string; // Nuevo campo
};

export default function AddBookModal() {
    const { register, handleSubmit, reset, watch } = useForm<SearchForm>({
        defaultValues: { title: "", author: "" }
    });
    const { searchMutation, addBookMutation } = useBookActions();

    // Observamos ambos valores para el botón de reset
    const { title: titleValue, author: authorValue } = watch();

    const onSearch = (data: SearchForm) => {
        // Enviamos ambos parámetros a la mutación
        // Tu hook useBookActions debe aceptar un objeto o dos argumentos
        searchMutation.mutate({ title: data.title, author: data.author });
    };

    const handleClear = () => {
        reset();
        searchMutation.reset();
    };

    const handleAdd = (book: Book) => {
        addBookMutation.mutate(book, {
            onSuccess: () => {
                const modal = document.getElementById("add_book_modal") as HTMLDialogElement;
                modal?.close();
                handleClear();
            }
        });
    };

    const foundBooks = searchMutation.data?.books || [];

    return (
        <dialog id="add_book_modal" className="modal">
            <div className="modal-box max-w-2xl bg-base-100 shadow-2xl border border-base-300 flex flex-col h-[80vh]">
                <form method="dialog">
                    <button 
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
                        onClick={handleClear}
                    >✕</button>
                </form>

                <h3 className="font-bold text-xl mb-4">Añadir a mi biblioteca</h3>

                {/* Formulario de Búsqueda Dual */}
                <form onSubmit={handleSubmit(onSearch)} className="flex flex-col gap-3 bg-base-200 p-4 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-60">Título</span></label>
                            <input
                                {...register("title", { required: true })}
                                type="text"
                                placeholder="Ej: El nombre del viento"
                                className="input input-bordered w-full focus:input-primary"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label py-1"><span className="label-text text-xs font-bold uppercase opacity-60">Autor (Opcional)</span></label>
                            <input
                                {...register("author")}
                                type="text"
                                placeholder="Ej: Patrick Rothfuss"
                                className="input input-bordered w-full focus:input-primary"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-2">
                        {(titleValue || authorValue) && (
                            <button type="button" onClick={handleClear} className="btn btn-ghost btn-sm">
                                Limpiar
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={searchMutation.isPending || !titleValue}
                            className="btn btn-primary btn-sm md:btn-md px-8"
                        >
                            {searchMutation.isPending && <span className="loading loading-spinner"></span>}
                            {searchMutation.isPending ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                </form>

                {/* Resultados */}
                <div className="mt-6 overflow-y-auto custom-scrollbar grow">
                    {searchMutation.isPending && (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton h-20 w-full rounded-xl opacity-50"></div>
                            ))}
                        </div>
                    )}

                    {foundBooks.length > 0 && (
                        <div className="grid grid-cols-1 gap-3">
                            {foundBooks.map((book: Book, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-base-100 border border-base-300 rounded-2xl hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="relative h-16 w-12 shrink-0 shadow-sm rounded overflow-hidden">
                                            <Image
                                                src={book.image_url || "data:image/webp;base64,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"}
                                                alt={book.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-sm truncate">{book.title}</h4>
                                            <p className="text-xs opacity-60 truncate">{book.author}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(book)}
                                        disabled={addBookMutation.isPending}
                                        className="btn btn-circle btn-ghost btn-sm text-success hover:bg-success/20"
                                        title="Añadir libro"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </dialog>
    );
}