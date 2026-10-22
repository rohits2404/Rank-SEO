"use client";

import { searchVisibilityTask } from "@/trigger/search-visibility";
import { VisibilityReportResult } from "@/types/search-visibility";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import {
    CheckIcon,
    CircleAlertIcon,
    CircleIcon,
    LoaderCircleIcon,
} from "lucide-react";

export const visibilitySteps = [
    "Preparing Visibility Scan",
    "Creating Customer Prompts",
    "Checking ChatGPT And Gemini",
    "Analysing Brand Mentions",
    "Building Visibility Report",
] as const;

type VisibilityProgress = {
    status: "PENDING" | "COLLECTING" | "ANALYZING" | "COMPLETED" | "FAILED";
    progress: number;
    currentStep: string;
    errorMessage?: string | null;
};

type LiveVisibilityProgressProps = {
    accessToken?: string;
    initialProgress: VisibilityProgress;
    onComplete?: (
        result: VisibilityReportResult | null,
        succeeded: boolean,
        errorMessage?: string,
    ) => void;
    runId?: string;
};

export function LiveVisibilityProgress({
    accessToken,
    initialProgress,
    onComplete,
    runId,
}: LiveVisibilityProgressProps) {
    const { run, error } = useRealtimeRun<typeof searchVisibilityTask>(runId, {
        accessToken,
        enabled: Boolean(runId && accessToken),
        skipColumns: ["payload"],

        onComplete: (completedRun, completionError) => {
            const rawResult = completedRun.output?.report ?? null;

            const result: VisibilityReportResult | null = rawResult
                ? {
                      ...rawResult,
                      competitors: rawResult.competitors.map((competitor) => ({
                          ...competitor,
                          domain: competitor.domain ?? undefined,
                      })),
                  }
                : null;

            const succeeded =
                completedRun.status === "COMPLETED" &&
                !completionError &&
                result !== null;

            const errorMessage = succeeded
                ? undefined
                : (completionError?.message ??
                  completedRun.error?.message ??
                  "The Visibility Scan Finished Without a Report Result.");

            onComplete?.(result, succeeded, errorMessage);
        },
    });

    const metadataProgress = run?.metadata?.progress;
    const metadataStep = run?.metadata?.currentStep;
    const progress = Math.max(
        initialProgress.progress,
        typeof metadataProgress === "number" ? metadataProgress : 0,
    );
    const safeProgress = Math.min(100, Math.max(0, progress));
    const currentStep =
        typeof metadataStep === "string"
            ? metadataStep
            : initialProgress.currentStep;
    const realtimeError = error?.message ?? run?.error?.message;
    const failed =
        initialProgress.status === "FAILED" ||
        Boolean(realtimeError) ||
        Boolean(run?.isCompleted && !run.isSuccess);

    if (failed) {
        return (
            <Card
                className="rounded-2xl border border-destructive/30 shadow-none ring-0"
                role="alert"
            >
                <CardHeader>
                    <CircleAlertIcon className="size-6 text-destructive" />
                    <CardTitle className="text-2xl font-semibold tracking-tight normal-case">
                        We Couldn&apos;t Finish This Visibility Scan
                    </CardTitle>
                    <CardDescription className="text-base">
                        {realtimeError ??
                            initialProgress.errorMessage ??
                            "Something Went Wrong Wile Checking Your AI Visibility."}
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const matchedStepIndex = visibilitySteps.findIndex(
        (step) => step === currentStep,
    );
    const activeStepIndex = Math.max(0, matchedStepIndex);

    return (
        <Card
            className="rounded-2xl border shadow-none ring-0 [--card-spacing:--spacing(7)]"
            aria-live="polite"
            aria-label="Generating AI visibility report"
        >
            <CardHeader className="border-b">
                <CardTitle className="text-2xl font-semibold tracking-tight normal-case">
                    Checking Your AI Visibility
                </CardTitle>
                <CardDescription className="text-base">
                    You Can Leave This Page. RankSEO Will Keep Processing The
                    Scan.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-7">
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold">{currentStep}</span>
                        <span className="font-semibold tabular-nums">
                            {safeProgress}%
                        </span>
                    </div>

                    <div
                        className="h-2 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="AI visibility scan progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={safeProgress}
                    >
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-500"
                            style={{ width: `${safeProgress}%` }}
                        />
                    </div>
                </div>

                <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                    {visibilitySteps.map((step, index) => {
                        const isComplete = index < activeStepIndex;
                        const isActive = index === activeStepIndex;

                        return (
                            <div
                                key={step}
                                className="flex items-center gap-3 text-sm"
                            >
                                {isComplete ? (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <CheckIcon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                ) : isActive ? (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <LoaderCircleIcon
                                            className="size-4 animate-spin"
                                            aria-hidden="true"
                                        />
                                    </span>
                                ) : (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <CircleIcon
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                )}

                                <span
                                    className={
                                        isActive ? "font-semibold" : undefined
                                    }
                                >
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
