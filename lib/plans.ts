export const PLAN_LIMITS = {
    free: {
        keywordSearches: 2,
        visibilityScans: 2,
    },
    pro: {
        keywordSearches: 100,
        visibilityScans: 25,
    },
    plus: {
        keywordSearches: 500,
        visibilityScans: 100,
    },
} as const;

export type BillingPlan = keyof typeof PLAN_LIMITS;

export type UsageFeature = keyof (typeof PLAN_LIMITS)["free"];
