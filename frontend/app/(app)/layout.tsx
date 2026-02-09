"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../components/navbar";
import { useAuth } from "@/app/hooks/use-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [user, isLoading, isAuthenticated, pathname]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center w-full h-full">
                <span className="loading loading-infinity loading-xl text-primary"></span>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full">
            <Navbar user={user} logout={logout} />
            {children}
        </div>
    )
}