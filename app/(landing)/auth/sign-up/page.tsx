import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import React from "react";

const SignUpPage = () => {
    return (
        <AuthCard
            title="Create Your RankSEO Account"
            description="Start Researching Keywords And AI Brand Visibility."
        >
            <SignUpForm />
        </AuthCard>
    );
};

export default SignUpPage;
