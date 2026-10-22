"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    async function handleLogout() {
        setIsPending(true);

        const { error } = await authClient.signOut();

        if (error) {
            toast.error(error.message || "We Could Not Sign You Out.");
            setIsPending(false);
            return;
        }

        router.replace("/auth/sign-in");
        router.refresh();
    }

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isPending}
        >
            <LogOut data-icon="inline-start" />
            {isPending ? "Signing Out…" : "Log Out"}
        </Button>
    );
}
