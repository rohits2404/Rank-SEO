"use client";

import {
    visibilitySearchSchema,
    VisibilitySearchValues,
} from "@/lib/search-visibility-schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "../ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";
import { CircleCheckIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export type { VisibilitySearchValues } from "@/lib/search-visibility-schema";

type VisibilitySearchFormProps = {
    isSearching?: boolean;
    onSearch: (values: VisibilitySearchValues) => void | Promise<void>;
    remaining?: number;
    isPaid?: boolean;
};

const platforms = ["ChatGPT", "Gemini"];

export function VisibilitySearchForm({
    isSearching = false,
    onSearch,
    remaining,
    isPaid = false,
}: VisibilitySearchFormProps) {
    const [platformIndex, setPlatformIndex] = useState(0);
    const usageExhausted = remaining === 0;
    const form = useForm<VisibilitySearchValues>({
        resolver: zodResolver(visibilitySearchSchema),
        mode: "onChange",
        defaultValues: {
            website: "",
            brand: "",
            topic: "",
        },
    });

    useEffect(() => {
        const rotation = window.setInterval(() => {
            setPlatformIndex((current) => (current + 1) % platforms.length);
        }, 2600);

        return () => window.clearInterval(rotation);
    }, []);

    const { dirtyFields, errors, isSubmitting, isValid } = form.formState;

    function isFieldValid(field: keyof VisibilitySearchValues) {
        return Boolean(
            dirtyFields[field] &&
            form.getValues(field).trim() &&
            !errors[field],
        );
    }

    return (
        <section className="rounded-2xl bg-linear-to-b from-primary/10 via-primary/5 to-background px-4 py-10 sm:px-8 lg:py-12">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
                <p className="rounded-full border border-primary/20 bg-background px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
                    AI Search Visibility
                </p>

                <div className="flex flex-col items-center gap-3">
                    <h1 className="flex gap-3 max-w-4xl text-4xl font-black tracking-tighter sm:text-5xl lg:text-[3.5rem]">
                        Check How You Rank In{" "}
                        <span
                            className="relative inline-grid min-w-[7.6ch] text-left text-primary"
                            aria-live="polite"
                        >
                            {platforms.map((platform, index) => (
                                <span
                                    key={platform}
                                    className={cn(
                                        "[grid-area:1/1] transition-all duration-500",
                                        index === platformIndex
                                            ? "translate-y-0 opacity-100"
                                            : "-translate-y-1 opacity-0",
                                    )}
                                    aria-hidden={index !== platformIndex}
                                >
                                    {platform}
                                </span>
                            ))}
                        </span>
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-base">
                        Find Opportunities In AI Results To Get Your Brand
                        Mentioned By LLM Platforms.
                    </p>
                </div>

                <form
                    className="grid w-full max-w-2xl gap-4 text-left"
                    onSubmit={form.handleSubmit(onSearch)}
                    noValidate
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            className="gap-2"
                            data-invalid={Boolean(errors.website)}
                        >
                            <FieldLabel
                                htmlFor="visibility-website"
                                className="text-sm font-semibold tracking-normal normal-case"
                            >
                                Website
                            </FieldLabel>
                            <InputGroup className="rounded-lg border border-input bg-background px-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                                <InputGroupInput
                                    id="visibility-website"
                                    type="url"
                                    placeholder="https://rankseo.com"
                                    disabled={isSearching || usageExhausted}
                                    aria-invalid={Boolean(errors.website)}
                                    {...form.register("website")}
                                />
                                {isFieldValid("website") && (
                                    <InputGroupAddon align="inline-end">
                                        <CircleCheckIcon className="size-4 text-primary" />
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                            <FieldError errors={[errors.website]} />
                        </Field>

                        <Field
                            className="gap-2"
                            data-invalid={Boolean(errors.brand)}
                        >
                            <FieldLabel
                                htmlFor="visibility-brand"
                                className="text-sm font-semibold tracking-normal normal-case"
                            >
                                Your Brand
                            </FieldLabel>
                            <InputGroup className="rounded-lg border border-input bg-background px-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                                <InputGroupInput
                                    id="visibility-brand"
                                    placeholder="RankSEO"
                                    disabled={isSearching || usageExhausted}
                                    aria-invalid={Boolean(errors.brand)}
                                    {...form.register("brand")}
                                />
                                {isFieldValid("brand") && (
                                    <InputGroupAddon align="inline-end">
                                        <CircleCheckIcon className="size-4 text-primary" />
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                            <FieldError errors={[errors.brand]} />
                        </Field>
                    </div>

                    <Field
                        className="gap-2"
                        data-invalid={Boolean(errors.topic)}
                    >
                        <FieldLabel
                            htmlFor="visibility-topic"
                            className="text-sm font-semibold tracking-normal normal-case"
                        >
                            Topic
                        </FieldLabel>
                        <InputGroup className="rounded-lg border border-input bg-background px-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
                            <InputGroupAddon>
                                <SearchIcon />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="visibility-topic"
                                placeholder="AI SEO Tools For Small Businesses"
                                disabled={isSearching || usageExhausted}
                                aria-invalid={Boolean(errors.topic)}
                                {...form.register("topic")}
                            />
                            {isFieldValid("topic") && (
                                <InputGroupAddon align="inline-end">
                                    <CircleCheckIcon className="size-4 text-primary" />
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                        <FieldError errors={[errors.topic]} />
                    </Field>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={
                            isSearching ||
                            isSubmitting ||
                            !isValid ||
                            usageExhausted
                        }
                        className="w-full border-0 bg-linear-to-r from-primary to-primary/80 text-sm font-semibold! tracking-normal text-primary-foreground shadow-sm hover:opacity-90"
                    >
                        <SparklesIcon
                            data-icon="inline-start"
                            className={
                                isSearching || isSubmitting
                                    ? "animate-spin"
                                    : undefined
                            }
                        />
                        {isSearching || isSubmitting
                            ? "Checking Visibility…"
                            : "Check AI Visibility"}
                    </Button>

                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
                        <span>
                            {remaining === undefined
                                ? "Loading Visibility Allowance..."
                                : `${remaining} ${isPaid ? "Visibility Scans Remaining This Month" : "Free Visibility Scans Remaining"}.`}
                        </span>
                        {!isPaid && (
                            <Button
                                variant="link"
                                size="xs"
                                className="h-auto px-0 tracking-normal normal-case"
                                render={<Link href="/billing" />}
                                nativeButton={false}
                            >
                                {usageExhausted
                                    ? "Unlock More Scans"
                                    : "Upgrade For More"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
