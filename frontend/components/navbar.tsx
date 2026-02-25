"use client";
import { BookOpenIcon, SparklesIcon, SwatchIcon } from "@heroicons/react/24/outline";
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
                <Link href="/library" className={`gap-2 ${pathname === "/library" ? 'text-secondary font-bold' : ''}`}>
                  <BookOpenIcon className="h-5 w-5" />
                  <span className="hidden md:inline">Biblioteca</span>
                </Link></li>
              <li>
                <Link href="/recommendations" className={`gap-2 ${pathname === "/recommendations" ? 'text-secondary font-bold' : ''}`}>
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
              <li className="menu-disabled">
                <a>
                  Perfil
                </a>
              </li>
              <li onClick={() => logout()} className="hover:text-error"><a>Cerrar sesión</a></li>
            </ul>
          </div>

          {/* <label className="swap swap-rotate">
            <input type="checkbox" className="theme-controller" value="dark" />

            <SunIcon className="swap-off size-8" />
            <MoonIcon className="swap-on size-8" />
          </label> */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-secondary m-1">
              <SwatchIcon className="size-5" />
              Color
              <svg
                width="12px"
                height="12px"
                className="inline-block h-2 w-2 fill-current opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048">
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
              </svg>
            </div>
            <ul tabIndex={-1} className="dropdown-content bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Claro"
                  value="light" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Oscuro"
                  value="dark" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Cupcake"
                  value="cupcake" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Pastel"
                  value="pastel" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Fantasía"
                  value="fantasy" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Esmeralda"
                  value="esmerald" />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Limonada"
                  value="lemonade" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}