"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { KeywordReport } from "@/lib/keyword-report";
import { KeywordResearchResponse } from "@/types/keyword-research";
import { useCallback } from "react";
import { keywordResearchTask } from "@/trigger/keyword-research";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { CheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";

const keywordSteps = [
    "Preparing Keyword Search",
    "Collecting Research Sources",
    "Reviewing Cited Sources",
    "Analysing Research Findings",
    "Building Keyword Report",
];

type LiveReportProgressProps = {
    accessToken: string;
    initialProgress: KeywordResearchResponse["report"];
    keyword: string;
    onComplete: (
        result: KeywordReport | null,
        succeeded: boolean,
        errorMessage?: string,
    ) => void;
    runId: string;
};

export function LiveReportProgress({
    accessToken,
    initialProgress,
    keyword,
    onComplete,
    runId,
}: LiveReportProgressProps) {
    const handleRunComplete = useCallback(
        (
            completedRun: {
                status: string;
                output?: unknown;
            },
            subscriptionError?: Error,
        ) => {
            const output = completedRun.output as
                { report?: KeywordReport | null } | undefined;
            const result = output?.report ?? null;
            const succeeded =
                completedRun.status === "COMPLETED" &&
                !subscriptionError &&
                result !== null;

            const errorMessage = succeeded
                ? undefined
                : (subscriptionError?.message ??
                  ("error" in completedRun &&
                  completedRun.error &&
                  typeof completedRun.error === "object" &&
                  "message" in completedRun.error &&
                  typeof completedRun.error.message === "string"
                      ? completedRun.error.message
                      : "The Research Run Finished Without a Report Result."));

            onComplete(result, succeeded, errorMessage);
        },
        [onComplete],
    );

    const { run, error } = useRealtimeRun<typeof keywordResearchTask>(runId, {
        accessToken,
        enabled: Boolean(runId && accessToken),
        onComplete: handleRunComplete,
        skipColumns: ["payload"],
    });

    const metadataProgress = run?.metadata?.progress;
    const metadataStep = run?.metadata?.currentStep;
    const progress =
        typeof metadataProgress === "number"
            ? metadataProgress
            : initialProgress.progress;

    const currentStep =
        typeof metadataStep === "string"
            ? metadataStep
            : initialProgress.currentStep;
    const safeProgress = Math.min(100, Math.max(0, progress));
    const matchedStepIndex = keywordSteps.findIndex(
        (step) => step === currentStep,
    );
    const activeStepIndex = Math.max(0, matchedStepIndex);

    return (
        <Card
            className="rounded-2xl border shadow-none ring-0 [--card-spacing:--spacing(7)]"
            aria-live="polite"
            aria-label={`Generating report for ${keyword}`}
        >
            <CardHeader className="border-b">
                <CardTitle className="text-2xl font-semibold tracking-tight normal-case">
                    Generating Your Report
                </CardTitle>
                <CardDescription className="text-base">
                    You Can Leave This Page. RankSEO Will Keep Processing The
                    Report.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-7">
                {error && (
                    <div
                        className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                        role="alert"
                    >
                        {error.message ||
                            "The Live Report Connection Was Interrupted. Please Try Again."}
                    </div>
                )}

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
                        aria-label={`Report generation progress for ${keyword}`}
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
                    {keywordSteps.map((step, index) => {
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
