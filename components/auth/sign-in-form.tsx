"use client";

import { signInSchema, SignInValues } from "@/lib/auth-schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

export function SignInForm() {
    const router = useRouter();
    const form = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: SignInValues) {
        const { error } = await authClient.signIn.email({
            email: values.email,
            password: values.password,
        });

        if (error) {
            toast.error(error.message || "We Could Not Sign You In.");
            return;
        }

        router.push("/ai-keyword");
        router.refresh();
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-5">
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                    <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
                    <Input
                        id="sign-in-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={Boolean(form.formState.errors.email)}
                        className="h-11 rounded-lg border border-input bg-background px-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                        {...form.register("email")}
                    />
                    <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.password)}>
                    <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
                    <Input
                        id="sign-in-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        aria-invalid={Boolean(form.formState.errors.password)}
                        className="h-11 rounded-lg border border-input bg-background px-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                        {...form.register("password")}
                    />
                    <FieldError errors={[form.formState.errors.password]} />
                </Field>

                <Button
                    type="submit"
                    className="mt-1 w-full"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Signing In…" : "Sign In"}
                </Button>
            </FieldGroup>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                New To RankSEO?{" "}
                <Link
                    href="/auth/sign-up"
                    className="font-semibold text-primary hover:underline"
                >
                    Create An Account
                </Link>
            </p>
        </form>
    );
}
