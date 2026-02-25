"use client"

import Link from "next/link";

export default function Home() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hola</h1>
          <p className="py-6">
            Aqui puedes registrar todos tus libros, tanto los pendientes como los que estás leyendo!!!
          </p>
          <Link href="/login">
            <button className="btn btn-primary">Empezar</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
