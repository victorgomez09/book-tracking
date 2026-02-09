"use client";
import { BookOpenIcon, SparklesIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user: {
    email: string,
    username: string
  },
  logout: () => Promise<void>
}

export default function Navbar({ user, logout }: NavbarProps) {
  const pathname = usePathname();

  return (
    <div className="px-6 pt-4">
      <div className="navbar bg-base-100 rounded-box shadow-sm border border-base-200 px-4 min-h-16">
        {/* Lado Izquierdo: Navegación */}
        <div className="navbar-start gap-2">
          {/* Logo o Título corto para móviles */}
          <Link href="/" className="btn btn-ghost text-xl font-black px-2 hidden sm:flex">
            Book<span className="text-primary">Log</span>
          </Link>

          <div className="flex gap-1">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/dashboard" className={`gap-2 ${pathname === "/dashboard" ? 'text-secondary font-bold' : ''}`}>
                  <BookOpenIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Biblioteca</span>
                </Link></li>
              <li>
                <Link href="/recommendations" className={`gap-2 ${pathname === "/recommended" ? 'text-secondary font-bold' : ''}`}>
                  <SparklesIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Recomendaciones</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="navbar-end gap-3">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-12 rounded-full">
                <span>{user.username.slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <ul
              tabIndex={-1}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a className="justify-between">
                  Perfil
                  <span className="badge">New</span>
                </a>
              </li>
              <li onClick={() => logout()} className="hover:text-error"><a>Cerrar sesión</a></li>
            </ul>
          </div>

          <label className="swap swap-rotate">
            <input type="checkbox" className="theme-controller" value="dark" />

            <SunIcon className="swap-off size-8" />
            <MoonIcon className="swap-on size-8" />
          </label>
        </div>
      </div>
    </div>
  );
}