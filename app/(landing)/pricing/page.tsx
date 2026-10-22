import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PricingSection } from "@/components/pricing/pricing-section";
import React from "react";

const PricingPage = () => {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8">
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
};

export default PricingPage;
