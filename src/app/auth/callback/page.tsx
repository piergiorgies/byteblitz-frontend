"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            localStorage.setItem("token", token);
            router.replace("/");
        } else {
            router.replace("/login");
        }
    }, [searchParams, router]);

    return <p>Logging in...</p>;
}
