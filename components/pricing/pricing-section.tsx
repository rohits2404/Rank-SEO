"use client";

import { BillingPlan } from "@/lib/plans";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";

type BillingPeriod = "monthly" | "yearly";

type PricingSectionProps = {
    context?: "public" | "billing";
    currentPlan?: BillingPlan;
    currentSubscriptionId?: string;
};

const plans = [
    {
        id: "free",
        name: "Free",
        description: "Explore RankSEO And Run Occasional AI SEO Research.",
        monthlyPrice: 0,
        yearlyPrice: 0,
        yearlyTotal: 0,
        featured: false,
        features: [
            "2 Lifetime AI Keyword Searches",
            "2 Lifetime AI Visibility Scans",
            "Keyword And Visibility Report History",
            "Basic Research And Visibility Results",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        description: "For Creators And Businesses Growing Through AI Search.",
        monthlyPrice: 29,
        yearlyPrice: 24,
        yearlyTotal: 288,
        featured: true,
        features: [
            "100 AI Keyword Searches Per Month",
            "25 AI Visibility Scans Per Month",
            "Full Keyword And Competitor Insights",
            "AI Summaries And Content Opportunities",
            "Saved Report History",
        ],
    },
    {
        id: "plus",
        name: "Plus",
        description: "For Teams Managing More Research And Visibility Checks.",
        monthlyPrice: 79,
        yearlyPrice: 65,
        yearlyTotal: 780,
        featured: false,
        features: [
            "500 AI Keyword Searches Per Month",
            "100 AI Visibility Scans Per Month",
            "Full Keyword And Competitor Insights",
            "AI Summaries And Content Opportunities",
            "Priority Support",
        ],
    },
] as const;

export function PricingSection({
    context = "public",
    currentPlan,
    currentSubscriptionId,
}: PricingSectionProps) {
    return (
        <section className="flex flex-col gap-8">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <SparklesIcon className="size-4" aria-hidden="true" />
                    Simple, Transparent Pricing
                </p>
                <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">
                    Grow Your Visibility In Search And AI
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                    Start Free, Then Upgrade When You Need More Keyword
                    Research, Visibility Scans, And Competitor Insights.
                </p>
            </div>

            <Tabs defaultValue="yearly" className="items-center">
                <TabsList className="h-11 rounded-lg">
                    <TabsTrigger
                        value="monthly"
                        className="h-full rounded-md px-5"
                    >
                        Monthly
                    </TabsTrigger>
                    <TabsTrigger
                        value="yearly"
                        className="h-full rounded-md px-5"
                    >
                        Yearly · Save Up To 17%
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="mt-6 w-full">
                    <PricingCards
                        period="monthly"
                        context={context}
                        currentPlan={currentPlan}
                        currentSubscriptionId={currentSubscriptionId}
                    />
                </TabsContent>
                <TabsContent value="yearly" className="mt-6 w-full">
                    <PricingCards
                        period="yearly"
                        context={context}
                        currentPlan={currentPlan}
                        currentSubscriptionId={currentSubscriptionId}
                    />
                </TabsContent>
            </Tabs>
        </section>
    );
}

function PricingCards({
    period,
    context,
    currentPlan,
    currentSubscriptionId,
}: {
    period: BillingPeriod;
    context: "public" | "billing";
    currentPlan?: BillingPlan;
    currentSubscriptionId?: string;
}) {
    const [pendingPlan, setPendingPlan] = useState<BillingPlan>();

    async function handlePlanChange(planId: BillingPlan) {
        setPendingPlan(planId);

        const { error } =
            planId === "free"
                ? await authClient.subscription.billingPortal({
                      returnUrl: "/billing",
                  })
                : await authClient.subscription.upgrade({
                      plan: planId,
                      annual: period === "yearly",
                      subscriptionId: currentSubscriptionId,
                      successUrl: "/billing?checkout=success",
                      cancelUrl: "/billing",
                      returnUrl: "/billing",
                      disableRedirect: false,
                  });

        if (error) {
            toast.error(error.message ?? "Unable To Open Stripe Billing");
            setPendingPlan(undefined);
        }
    }

    return (
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
                const isCurrentPlan = currentPlan === plan.id;
                const displayedPrice =
                    period === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

                return (
                    <Card
                        key={plan.id}
                        className={cn(
                            "min-h-112 rounded-2xl border shadow-none ring-0",
                            (plan.featured || isCurrentPlan) &&
                                "border-primary ring-1 ring-primary",
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="text-2xl normal-case tracking-tight">
                                {plan.name}
                            </CardTitle>
                            <CardDescription>
                                {plan.description}
                            </CardDescription>
                            {plan.featured && (
                                <CardAction className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    Most Popular
                                </CardAction>
                            )}
                        </CardHeader>

                        <CardContent className="flex flex-1 flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-black tracking-tighter tabular-nums">
                                        ${displayedPrice}
                                    </span>
                                    <span className="pb-1 text-sm text-muted-foreground">
                                        /Month
                                    </span>
                                </div>
                                <p className="min-h-5 text-xs text-muted-foreground">
                                    {period === "yearly" && plan.yearlyTotal > 0
                                        ? `$${plan.yearlyTotal} Billed Yearly`
                                        : plan.id === "free"
                                          ? "No Credit Card Required"
                                          : "Billed Monthly"}
                                </p>
                            </div>

                            <ul className="flex flex-col gap-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-3 text-sm leading-relaxed"
                                    >
                                        <CheckIcon
                                            className="mt-0.5 size-4 shrink-0 text-primary"
                                            aria-hidden="true"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter>
                            {context === "public" ? (
                                <Button
                                    size="lg"
                                    variant={
                                        plan.featured ? "default" : "outline"
                                    }
                                    className={cn(
                                        "w-full",
                                        plan.featured &&
                                            "border-0 bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90",
                                    )}
                                    render={<Link href="/auth/sign-up" />}
                                    nativeButton={false}
                                >
                                    {plan.id === "free"
                                        ? "Start Free"
                                        : `Choose ${plan.name}`}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    size="lg"
                                    variant={
                                        plan.featured ? "default" : "outline"
                                    }
                                    disabled={
                                        isCurrentPlan || Boolean(pendingPlan)
                                    }
                                    onClick={() =>
                                        void handlePlanChange(plan.id)
                                    }
                                    className={cn(
                                        "w-full",
                                        plan.featured &&
                                            "border-0 bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90",
                                    )}
                                >
                                    {isCurrentPlan
                                        ? "Current plan"
                                        : pendingPlan === plan.id
                                          ? "Opening Stripe..."
                                          : plan.id === "free"
                                            ? "Manage Downgrade"
                                            : currentPlan === "free"
                                              ? `Upgrade To ${plan.name}`
                                              : `Switch To ${plan.name}`}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}

export function ManageBillingButton() {
    const [isOpening, setIsOpening] = useState(false);

    async function handleManageBilling() {
        setIsOpening(true);
        const { error } = await authClient.subscription.billingPortal({
            returnUrl: "/billing",
        });

        if (error) {
            toast.error(error.message ?? "Unable To Open Stripe Billing");
            setIsOpening(false);
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            disabled={isOpening}
            onClick={() => void handleManageBilling()}
        >
            {isOpening ? "Opening Stripe..." : "Manage Billing"}
        </Button>
    );
}
