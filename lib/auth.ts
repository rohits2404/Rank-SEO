import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-ignore
    apiVersion: "2026-07-29.dahlia",
});

export const auth = betterAuth({
    appName: "RankSEO",

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
    },

    advanced: {
        database: {
            generateId: false,
        },
    },

    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

            subscription: {
                enabled: true,
                plans: [
                    {
                        name: "pro",
                        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
                        annualDiscountPriceId:
                            process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
                        limits: PLAN_LIMITS.pro,
                    },
                    {
                        name: "plus",
                        priceId: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID!,
                        annualDiscountPriceId:
                            process.env.STRIPE_PLUS_YEARLY_PRICE_ID!,
                        limits: PLAN_LIMITS.plus,
                    },
                ],
            },
        }),

        nextCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;
