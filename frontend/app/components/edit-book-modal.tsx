"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useBookActions } from "../hooks/use-book-actions";
import { Book } from "../hooks/use-books";

export default function EditBookModal({ book }: { book: Book }) {
    const { register, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            status: book.status,
            current_page: book.current_page,
            rating: book.rating,
            notes: book.notes,
            tags: book.tags
        }
    });
    const { updateBookMutation } = useBookActions();
    const currentRating = watch("rating");

    useEffect(() => {
        reset({
            status: book.status,
            current_page: book.current_page,
            rating: book.rating || 0,
            notes: book.notes || "",
            tags: book.tags || ""
        });
    }, [book, reset]);

    const onSubmit = (data: any) => {
        updateBookMutation.mutate({
            userBookId: book.id,
            data
        }, {
            onSuccess: () => (document.getElementById("edit_modal") as any).close()
        });
    };

    return (
        <dialog id="edit_modal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box bg-base-100 rounded-[2.5rem] p-8">
                <h3 className="font-black text-2xl mb-6 text-center">Gestionar Lectura</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Estado */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Estado</legend>
                        <select defaultValue="Pick a text editor" className="select select-primary w-full" {...register("status")}>
                            <option value="PENDING">🕒 Pendiente</option>
                            <option value="READING">📖 Leyendo</option>
                            <option value="COMPLETED">✅ Completado</option>
                            <option value="DROPPED">❌ Abandonado</option>
                        </select>
                    </fieldset>

                    {/* Progreso de Páginas */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Página actual</legend>
                        <div className="flex items-center gap-2 w-full">
                            <input type="number" className="input input-bordered input-primary w-full" {...register("current_page")} />
                            <p className="label">de {book.page_count}</p>
                        </div>
                    </fieldset>

                    {/* Rating con Estrellas de DaisyUI */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">¿Qué te está pareciendo?</legend>
                        <div className="rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <input key={star} type="radio" name="rating-2" className="mask mask-star-2 bg-warning" aria-label="1 star" checked={currentRating === star}
                                    onChange={() => setValue("rating", star)} />
                            ))}
                        </div>
                    </fieldset>

                    {/* Notas */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Notas personales</legend>
                        <div className="flex items-center gap-2 w-full">
                            <textarea className="textarea textarea-bordered textarea-primary w-full" {...register("notes")} placeholder="Escribe algo que quieras recordar..." />
                        </div>
                    </fieldset>

                    {/* Tags (Input simple para esta versión) */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Etiquetas</legend>
                        <input type="text" className="input input-bordered input-primary w-full"  {...register("tags")} />
                        <p className="label italic">Separalas por comas(,)</p>
                    </fieldset>

                    <div className="modal-action flex-col gap-2">
                        <button className={`btn btn-primary btn-block rounded-2xl border-none bg-emerald-400 hover:bg-emerald-500 text-white font-bold h-12 ${updateBookMutation.isPending ? 'loading' : ''}`}>
                            Guardar cambios
                        </button>
                        <button type="button" onClick={() => (document.getElementById("edit_modal") as any).close()} className="btn btn-ghost btn-block">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}