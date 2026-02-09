import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Obtenemos el token de las cookies (asegúrate de guardarlo ahí al hacer login)
    const token = localStorage.getItem("token");
    const { pathname } = request.nextUrl;

    // Definir rutas protegidas
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/recommendations')) {
        if (!token) {
            // Si no hay token, redirigir al login
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
    matcher: ['/dashboard/:path*', '/recommendations/:path*'],
};