"use client";

import { authClient } from "@/lib/auth-client";
import { signUpSchema, SignUpValues } from "@/lib/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

export function SignUpForm() {
    const router = useRouter();
    const form = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: SignUpValues) {
        const { error } = await authClient.signUp.email({
            name: values.name,
            email: values.email,
            password: values.password,
        });

        if (error) {
            toast.error(error.message || "We Could Not Create Your Account.");
            return;
        }

        router.push("/ai-keyword");
        router.refresh();
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-5">
                <Field data-invalid={Boolean(form.formState.errors.name)}>
                    <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
                    <Input
                        id="sign-up-name"
                        autoComplete="name"
                        placeholder="Your Name"
                        aria-invalid={Boolean(form.formState.errors.name)}
                        className="h-11 rounded-lg border border-input bg-background px-3 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
                        {...form.register("name")}
                    />
                    <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field data-invalid={Boolean(form.formState.errors.email)}>
                    <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                    <Input
                        id="sign-up-email"
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
                    <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                    <Input
                        id="sign-up-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At Least 8 Characters"
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
                    {form.formState.isSubmitting
                        ? "Creating Account…"
                        : "Create Account"}
                </Button>
            </FieldGroup>

            <p className="mt-5 text-center text-sm text-muted-foreground">
                Already Have An Account?{" "}
                <Link
                    href="/auth/sign-in"
                    className="font-semibold text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </form>
    );
}
