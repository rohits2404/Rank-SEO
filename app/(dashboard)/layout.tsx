import { DashboardNavbar } from "@/components/dashboard-navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const DashboardLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/sign-in");
    }

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <DashboardNavbar user={session.user} />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default DashboardLayout;
