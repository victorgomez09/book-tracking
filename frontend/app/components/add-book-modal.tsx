"use client";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useBookActions } from "../hooks/use-book-actions";
import { Book } from "../hooks/use-books";

type SearchForm = {
    title: string;
};

export default function AddBookModal() {
    const { register, handleSubmit, reset, watch } = useForm<SearchForm>();
    const { searchMutation, addBookMutation } = useBookActions();

    // Observamos el valor para habilitar/deshabilitar el botón de búsqueda
    const titleValue = watch("title");

    const onSearch = (data: SearchForm) => {
        searchMutation.mutate(data.title);
    };

    const handleAdd = (book: Book) => {
        addBookMutation.mutate(book, {
            onSuccess: () => {
                // Cerramos el modal usando la API nativa de HTML
                const modal = document.getElementById("add_book_modal") as HTMLDialogElement;
                modal?.close();
                reset(); // Limpia el buscador para la próxima vez
                searchMutation.reset(); // Limpia los resultados previos
            }
        });
    };

    return (
        <dialog id="add_book_modal" className="modal">
            <div className="modal-box max-w-2xl bg-base-100 shadow-2xl border border-base-300">
                {/* Botón X para cerrar */}
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => reset()}>✕</button>
                </form>

                <h3 className="font-bold text-xl mb-6">Añadir a mi biblioteca</h3>

                {/* Formulario de Búsqueda */}
                <form onSubmit={handleSubmit(onSearch)} className="flex gap-2">
                    <div className="relative w-full">
                        <input
                            {...register("title", { required: true })}
                            type="text"
                            placeholder="Escribe el título de un libro..."
                            className="input input-bordered w-full pr-10 focus:input-primary"
                        />
                        {titleValue && (
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="absolute right-3 top-3 text-xs opacity-50 hover:opacity-100"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={searchMutation.isPending || !titleValue}
                        className={`btn btn-primary ${searchMutation.isPending ? 'loading' : ''}`}
                    >
                        Buscar
                    </button>
                </form>

                {/* Contenedor de Resultados */}
                <div className="mt-8 max-h-96 overflow-y-auto custom-scrollbar">
                    {searchMutation.isPending && (
                        <div className="flex flex-col gap-4">
                            <div className="skeleton h-24 w-full"></div>
                            <div className="skeleton h-24 w-full"></div>
                        </div>
                    )}

                    {searchMutation.data && (
                        <div className="flex items-center justify-between p-4 bg-base-200 rounded-xl hover:bg-base-300 transition-colors group border border-transparent hover:border-primary/20">
                            <div className="flex items-center gap-4">
                                <div className="relative h-24 w-16 shrink-0 shadow-lg overflow-hidden rounded-md border border-base-300 bg-white">
                                    <Image
                                        src={searchMutation.data?.book.image_url || "https://via.placeholder.com/150x200?text=No+Cover"}
                                        alt="cover"
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-md leading-tight">{searchMutation.data?.book.title}</p>
                                    <p className="text-sm opacity-70 mt-1">{searchMutation.data?.book.author}</p>
                                    <div className="badge badge-outline badge-sm mt-2 opacity-50">
                                        {searchMutation.data?.book.page_count || "?"} páginas
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleAdd(searchMutation.data.book)}
                                disabled={addBookMutation.isPending}
                                className={`btn btn-success btn-sm md:btn-md shadow-md ${addBookMutation.isPending ? 'loading' : ''}`}
                            >
                                {addBookMutation.isPending ? 'Añadiendo' : 'Añadir'}
                            </button>
                        </div>
                    )}

                    {searchMutation.isError && (
                        <div className="alert alert-warning shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span>No se encontraron resultados. Prueba con otro título.</span>
                        </div>
                    )}
                </div>
            </div>
        </dialog>
    );
}