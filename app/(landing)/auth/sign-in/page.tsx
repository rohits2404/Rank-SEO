import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import React from "react";

const SignInPage = () => {
    return (
        <AuthCard
            title="Welcome Back"
            description="Sign In To Continue To Your SEO Workspace."
        >
            <SignInForm />
        </AuthCard>
    );
};

export default SignInPage;
