"use client";
import { ArrowPathIcon, CheckBadgeIcon, DocumentTextIcon, MagnifyingGlassIcon, PlusIcon, SparklesIcon, StarIcon, TagIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import AddBookModal from "../components/add-book-modal";
import EditBookModal from "../components/edit-book-modal";
import { Book, useBooks } from "../hooks/use-books";
import { parseStatus, parseStatusColor } from "../utils/status";

export default function DashboardPage() {
    const [selectedBook, setSelectedBook] = useState<Book>({} as Book)
    const { data: books, isLoading } = useBooks();

    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchTerm);
        }, 250); // 500ms es el estándar, cámbialo a 2000 si quieres 2 segundos

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredBooks = useMemo(() => {
        if (!books) return [];

        return books.filter((book) => {
            const matchesSearch =
                book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(debouncedQuery.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || book.status === statusFilter;
            const matchesCategory = categoryFilter === "ALL" || book.category === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [books, debouncedQuery, statusFilter, categoryFilter]);

    const categories = useMemo(() => {
        if (!books) return [];

        const uniqueCategories = Array.from(
            new Set(books.map((book) => book.category).filter(Boolean))
        );

        return uniqueCategories.sort();
    }, [books]);

    const stats = useMemo(() => {
        if (!books) return { totalRead: 0, pagesRead: 0, favoriteGenre: "---", avgRating: 0 };

        const completedBooks = books.filter(b => b.status === "COMPLETED");
        const totalPages = completedBooks.reduce((acc, b) => acc + b.page_count, 0);

        // Encontrar la categoría más repetida
        const categories = books.map(b => b.category).filter(Boolean);
        const genreCounts = categories.reduce((acc: any, cur) => {
            acc[cur] = (acc[cur] || 0) + 1;
            return acc;
        }, {});
        const topGenre = Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b, "---");

        const avgRating = completedBooks.length
            ? (completedBooks.reduce((acc, b) => acc + b.rating, 0) / completedBooks.length).toFixed(1)
            : 0;

        return {
            totalRead: completedBooks.length,
            // pagesRead: totalPages,
            pagesRead: 30000000000620,
            favoriteGenre: topGenre,
            avgRating
        };
    }, [books]);

    const getReaderLevel = (pages: number) => {
        if (pages === 0)
            return { title: "Hoja en Blanco", color: "text-base-content", desc: "¡Empieza tu primera aventura!" };
        if (pages < 500)
            return { title: "Curioso de Portadas", color: "text-base-content", desc: "Explorando los primeros capítulos" };
        if (pages < 2000)
            return { title: "Aprendiz de Biblioteca", color: "text-info", desc: "Ya conoces el olor del papel" };
        if (pages < 5000)
            return { title: "Viajero Entre Mundos", color: "text-primary", desc: "Has cruzado fronteras invisibles" };
        if (pages < 10000)
            return { title: "Erudito en Ciernes", color: "text-secondary", desc: "Tus estanterías empiezan a pesar" };
        if (pages < 25000)
            return { title: "Devorador de Sagas", color: "text-accent", desc: "No hay trilogía que se te resista" };
        if (pages < 50000)
            return { title: "Guardián de Historias", color: "text-warning", desc: "Tu conocimiento es vasto y profundo" };
        if (pages < 100000)
            return { title: "Maestro Bibliotecario", color: "text-success", desc: "Los libros te susurran sus secretos" };

        return { title: "Leyenda Literaria", color: "bg-gradient-to-r from-primary via-accent to-secondary inline-block text-transparent bg-clip-text", desc: "Has leído lo que otros ni imaginan" };
    };

    const level = getReaderLevel(stats.pagesRead);

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="flx flex-col p-6 pb-24 w-full h-full">
            <header className="flex flex-col justify-between gap-4 mb-10">
                <h1 className="text-4xl font-black text-base-content">Mi Biblioteca</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Card: Libros Terminados */}
                    <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-box p-6">
                        <div className="stat-figure text-primary">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-12">
                                    <CheckBadgeIcon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-title font-bold text-xs uppercase opacity-50">Conquistados</div>
                        <div className="stat-value text-primary text-3xl">{stats.totalRead}</div>
                        <div className="stat-desc font-medium mt-1">Libros terminados</div>
                    </div>

                    {/* Card: Páginas Totales con Meta */}
                    <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-box p-6">
                        <div className="stat-figure text-secondary">
                            <DocumentTextIcon className="w-8 h-8" />
                        </div>
                        <div className="stat-title font-bold text-xs uppercase">Odisea de Papel</div>
                        <div className="stat-value text-2xl">{stats.pagesRead.toLocaleString()}</div>
                        <div className="stat-desc mt-1 flex items-center gap-1">
                            {(() => {
                                // Calculamos el siguiente hito (si es 0, el primero es 1000)
                                // Si estamos justo en un hito (ej. 1000), saltamos al siguiente (2000)
                                const nextMilestone = stats.pagesRead === 0
                                    ? 1000
                                    : (Math.floor(stats.pagesRead / 1000) + 1) * 1000;
                                // El inicio del tramo actual (ej. si llevas 1200, empezaste en 1000)
                                const currentStart = nextMilestone - 1000;
                                // Progreso dentro de los 1000 actuales (ej. 200 de 1000)
                                const progressInSegment = stats.pagesRead - currentStart;

                                return (
                                    <>
                                        <progress
                                            className="progress progress-secondary w-20 h-1.5"
                                            value={progressInSegment}
                                            max="1000"
                                        ></progress>
                                        <span className="text-[10px] font-bold opacity-70">
                                            Próximo hito: {nextMilestone.toLocaleString()}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Card: Género Favorito */}
                    <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-box p-6">
                        <div className="stat-figure text-accent">
                            <SparklesIcon className="w-8 h-8" />
                        </div>
                        <div className="stat-title font-bold text-xs uppercase opacity-50">Tu Zona de Confort</div>
                        <div className="stat-value text-xl truncate w-32">{stats.favoriteGenre}</div>
                        <div className="stat-desc font-medium mt-1">Es tu género más leído</div>
                    </div>

                    {/* Card: Rating Medio */}
                    <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-box p-6 text-center md:text-left">
                        <div className="stat-figure text-accent">
                            <StarIcon className="w-8 h-8 fill-current" />
                        </div>
                        <div className="stat-title font-bold text-xs uppercase opacity-50">Criterio Crítico</div>
                        <div className="stat-value flex items-center gap-2 justify-center md:justify-start">
                            {stats.avgRating}
                        </div>
                        <div className="stat-desc font-medium mt-1">Valoración media</div>
                    </div>
                </div>

                {/* Nivel del lector */}
                <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-box p-6 text-center md:text-left">
                    <div className="stat-title font-bold text-xs uppercase">Nivel del lector</div>
                    <div className={`stat-value ${level.color} w-fit`}>
                        {level.title}
                    </div>
                    <div className="stat-desc font-medium mt-1">
                        {level.desc}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                    <label className="col-span-8 input input-bordered w-full">
                        <MagnifyingGlassIcon className="h-5 w-5 opacity-30" />
                        <input
                            type="text"
                            placeholder="Buscar título o autor..."
                            className="grow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>

                    {/* Filtro por Estado */}
                    <select
                        className="col-span-2 select select-bordered bg-base-100 font-bold w-full"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="READING">Leyendo</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="COMPLETED">Terminado</option>
                        <option value="DROPPED">Abandonado</option>
                    </select>

                    {/* Filtro por categoria */}
                    <select
                        className="col-span-2 select select-bordered bg-base-100 font-bold w-full"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="ALL">Todas las categorias</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
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
                    <div className="relative h-44 w-32 rounded-box overflow-hidden">
                        <Image
                            src={coverUrl}
                            alt={book.title}
                            loading="eager"
                            fill
                            className="object-cover"
                            sizes="128px"
                        />
                    </div>

                    <div className="absolute -top-8 right-12 text-warning text-lg">
                        {[...Array(book.rating).keys()].map((_, index) => (
                            <StarIcon key={index} className="size-4 fill-current" />
                        ))}
                    </div>
                </figure>

                <div className="card-body p-4 items-center text-center gap-0">
                    <div className="card-title flex flex-col mb-4">
                        <h2 className="text-sm font-extrabold text-base-content">
                            {book.title}
                        </h2>
                        <span className="text-sm opacity-60">{book.author}</span>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-1">
                            <ArrowPathIcon className="size-4" />
                            <span className={`badge badge-sm badge-soft badge-${parseStatusColor(book.status)}`}>
                                {parseStatus(book.status)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <TagIcon className="size-4" />
                            {book.category.split(",").map((category, index) => {
                                return (
                                    <span key={index} className="badge badge-sm badge-soft uppercase">{category}</span>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}