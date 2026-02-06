"use client";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Book, useBooks } from "../hooks/use-books";
import AddBookModal from "../components/add-book-modal";
import { parseStatus, parseStatusColor } from "../utils/status";
import EditBookModal from "../components/edit-book-modal";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
    const [selectedBook, setSelectedBook] = useState<Book>({} as Book)
    const { data: books, isLoading, isError } = useBooks();

// 1. Estado para el valor visual del input (inmediato)
    const [searchTerm, setSearchTerm] = useState("");
    // 2. Estado para el valor que realmente filtra (debounced)
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // 3. Efecto de Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 250); // 500ms es el estándar, cámbialo a 2000 si quieres 2 segundos

        return () => clearTimeout(handler); // Limpia el timeout si el usuario sigue escribiendo
    }, [searchTerm]);

    // Lógica de filtrado
    const filteredBooks = useMemo(() => {
        if (!books) return [];
        return books.filter((book) => {
            const matchesSearch = 
                book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(debouncedQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "ALL" || book.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [books, debouncedQuery, statusFilter]);

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="p-6 pb-24">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <h1 className="text-4xl font-black text-base-content">Mi Biblioteca</h1>
                
                <div className="flex flex-wrap gap-2">
                    {/* Barra de Búsqueda */}
                    <div className="relative group">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                        <input 
                            type="text" 
                            placeholder="Buscar título o autor..." 
                            className="input input-bordered pl-10 w-full md:w-64 rounded-2xl bg-base-100 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtro por Estado */}
                    <select 
                        className="select select-bordered rounded-2xl bg-base-100 shadow-sm font-bold"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="READING">📖 Leyendo</option>
                        <option value="PENDING">🕒 Pendiente</option>
                        <option value="COMPLETED">✅ Terminado</option>
                        <option value="DROPPED">❌ Abandonado</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-4 gap-y-12 w-full">
                {filteredBooks?.map((book) => (
                    <BookCard key={book.id} book={book} setSelectedBook={setSelectedBook} />
                ))}

                {books?.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-base-200 rounded-box">
                        <p className="text-xl opacity-50">No tienes libros aún. ¡Añade el primero!</p>
                    </div>
                )}
            </div>

            <button
                className="btn btn-primary btn-circle btn-lg fixed bottom-8 right-8 shadow-lg hover:scale-110 transition-transform"
                onClick={() => (window as any).add_book_modal.showModal()}
            >
                <PlusIcon className="h-8 w-8 text-white" />
            </button>

            <AddBookModal />
            <EditBookModal book={selectedBook} />
        </div>
    );
}

function BookCard({ book, setSelectedBook }: { book: Book, setSelectedBook: Dispatch<SetStateAction<Book>> }) {
    const coverUrl = book.image_url || "https://via.placeholder.com/150x200?text=No+Cover";

    return (
        <div className="group mt-10 w-full max-w-60 cursor-pointer" onClick={() => { setSelectedBook(book); (document.getElementById("edit_modal") as any).showModal() }}>
            <div className="card bg-base-100 shadow-sm border-none overflow-visible">
                <figure className="px-3 -mt-10 overflow-visible">
                    <div className="relative h-44 w-32 rounded-xl overflow-hidden">
                        <Image
                            src={coverUrl}
                            alt={book.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                        />
                    </div>
                    {[ ...Array(book.rating).keys()].map((_, index) => (
                        <div key={index} className="absolute -top-8 right-12 text-warning text-lg drop-shadow-md">★</div>
                    ))}
                </figure>

                <div className="card-body p-4 items-center text-center gap-0">
                    <div className="card-title flex flex-col mb-4">
                        <h2 className="text-sm font-extrabold text-base-content">
                            {book.title}
                        </h2>
                        <span className="text-sm opacity-60">{book.author}</span>
                    </div>

                    {/* Sección de Progreso */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className={`badge badge-sm badge-soft badge-${parseStatusColor(book.status)}`}>
                                {parseStatus(book.status)}
                            </span>
                            <span className={`text-[10px] font-bold text-${parseStatusColor(book.status)}`}>{Math.round(book.progress)}%</span>
                        </div>

                        {/* Progress de DaisyUI personalizado */}
                        {/* <progress 
              className="progress progress-success w-full h-1.5 bg-gray-100" 
              value={book.current_page} 
              max={book.total_pages}
            ></progress> */}
                    </div>

                    {/* Acciones de DaisyUI */}
                    {/* <div className="card-actions w-full mt-5">
            <button className="btn btn-primary btn-block btn-sm rounded-xl border-none bg-emerald-400 hover:bg-emerald-500 text-white font-bold normal-case h-10 min-h-10">
              Gestionar
            </button>
          </div> */}
                </div>
            </div>

        </div>
    );
}