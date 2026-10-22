import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import React from "react";

const AuthLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex min-h-screen flex-col bg-muted/20">
            <Header />
            <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default AuthLayout;
