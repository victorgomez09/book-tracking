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
                            className={`btn btn-primary btn-sm md:btn-md px-8 ${searchMutation.isPending ? 'loading' : ''}`}
                        >
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
                                                src={book.image_url || "https://via.placeholder.com/150x200?text=No+Cover"}
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