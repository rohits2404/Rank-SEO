import "server-only";

import { auth } from "./auth";
import { headers } from "next/headers";
import { BillingPlan, PLAN_LIMITS, UsageFeature } from "./plans";
import { prisma } from "./prisma";
import { ReportType } from "./generated/prisma/client";

export async function getBillingStatus(userId: string) {
    const subscriptions = await auth.api.listActiveSubscriptions({
        headers: await headers(),
    });
    const subscription = subscriptions.find(
        (item) => item.status === "active" || item.status === "trialing",
    );

    const plan: BillingPlan =
        subscription?.plan === "plus"
            ? "plus"
            : subscription?.plan === "pro"
              ? "pro"
              : "free";
    const limits = PLAN_LIMITS[plan];
    const now = new Date();
    const monthStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const usagePeriod =
        plan === "free" ? {} : { createdAt: { gte: monthStart } };

    const [keywordSearches, visibilityScans] = await Promise.all([
        prisma.report.count({
            where: {
                userId,
                type: ReportType.KEYWORD,
                ...usagePeriod,
            },
        }),
        prisma.report.count({
            where: {
                userId,
                type: ReportType.VISIBILITY,
                ...usagePeriod,
            },
        }),
    ]);

    return {
        plan,
        isPaid: plan !== "free",
        subscription: subscription
            ? {
                  stripeSubscriptionId: subscription.stripeSubscriptionId,
                  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
                  billingInterval: subscription.billingInterval,
                  periodEnd: subscription.periodEnd,
              }
            : null,
        usage: {
            keywordSearches: getUsage(keywordSearches, limits.keywordSearches),
            visibilityScans: getUsage(visibilityScans, limits.visibilityScans),
        },
    };
}

export async function getCurrentBillingStatus() {
    const session = await auth.api.getSession({ headers: await headers() });
    return session ? getBillingStatus(session.user.id) : null;
}

export async function checkUsageLimit(userId: string, feature: UsageFeature) {
    const billing = await getBillingStatus(userId);
    return {
        allowed: billing.usage[feature].remaining > 0,
        billing,
    };
}

function getUsage(used: number, limit: number) {
    return {
        used,
        limit,
        remaining: Math.max(limit - used, 0),
    };
}
