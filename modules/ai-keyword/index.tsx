"use client";

import { KeywordLandingState } from "@/components/ai-keyword/keyword-landing-state";
import {
    KeywordSearchRow,
    KeywordSearchValues,
} from "@/components/ai-keyword/keyword-search-row";
import { KeywordReportView } from "@/components/reports/keyword-report-view";
import { LiveReportProgress } from "@/components/reports/live-report-progress";
import { ReportFailed } from "@/components/reports/report-failed";
import { useBilling } from "@/hooks/use-billing";
import { KeywordReport } from "@/lib/keyword-report";
import { KeywordResearchResponse } from "@/types/keyword-research";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";

async function startKeywordResearch(input: {
    keyword: string;
    country: string;
}): Promise<KeywordResearchResponse> {
    const response = await fetch("/api/keyword-research", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    const body = (await response.json().catch(() => null)) as {
        message?: string;
    } | null;

    if (!response.ok) {
        throw new Error(body?.message ?? "Unable To Start Keyword Research");
    }

    return body as KeywordResearchResponse;
}

export function AIKeyword() {
    const billing = useBilling();
    const [submittedKeyword, setSubmittedKeyword] = useState<string | null>(
        null,
    );
    const [researchFinished, setResearchFinished] = useState(false);
    const [researchSucceeded, setResearchSucceeded] = useState(false);
    const [failureMessage, setFailureMessage] = useState<string | null>(null);
    const [reportResult, setReportResult] = useState<KeywordReport | null>(
        null,
    );
    const [submittedSearch, setSubmittedSearch] =
        useState<KeywordSearchValues | null>(null);
    const [researchResponse, setResearchResponse] =
        useState<KeywordResearchResponse | null>(null);

    const keywordResearchMutation = useMutation({
        mutationFn: startKeywordResearch,
    });

    async function handleSearch(values: KeywordSearchValues) {
        if (billing.data?.usage.keywordSearches.remaining === 0) {
            toast.error("Keyword Search Limit Reached", {
                description: billing.data.isPaid
                    ? "Your Monthly Allowance has Been Used."
                    : "Upgrade Your Plan To Run More Keyword Searches.",
            });
            return;
        }

        setSubmittedKeyword(values.keyword);
        setSubmittedSearch(values);
        setResearchFinished(false);
        setResearchSucceeded(false);
        setFailureMessage(null);
        setReportResult(null);
        setResearchResponse(null);

        try {
            const response = await keywordResearchMutation.mutateAsync({
                keyword: values.keyword,
                country: values.country,
            });

            setResearchResponse(response);
            void billing.refetch();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable To Start Keyword Research";

            setResearchFinished(true);
            setFailureMessage(message);
            toast.error(message);
        }
    }

    const handleResearchComplete = useCallback(
        (
            result: KeywordReport | null,
            succeeded: boolean,
            errorMessage?: string,
        ) => {
            setReportResult(result);
            setResearchSucceeded(succeeded);
            setFailureMessage(succeeded ? null : (errorMessage ?? null));
            setResearchFinished(true);
        },
        [],
    );

    const isResearching =
        keywordResearchMutation.isPending ||
        Boolean(researchResponse && !researchFinished);

    return (
        <div className="min-h-full bg-muted/20">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8">
                <KeywordSearchRow
                    isSearching={isResearching}
                    onSearch={handleSearch}
                    remaining={billing.data?.usage.keywordSearches.remaining}
                    isPaid={billing.data?.isPaid}
                />

                {researchResponse && submittedKeyword && !researchFinished ? (
                    <LiveReportProgress
                        keyword={submittedKeyword}
                        initialProgress={researchResponse.report}
                        runId={researchResponse.runId}
                        accessToken={researchResponse.publicAccessToken}
                        onComplete={handleResearchComplete}
                    />
                ) : researchFinished &&
                  researchSucceeded &&
                  submittedKeyword &&
                  reportResult ? (
                    <KeywordReportView
                        keyword={submittedKeyword}
                        report={reportResult}
                    />
                ) : researchFinished && !researchSucceeded ? (
                    <ReportFailed
                        errorMessage={failureMessage}
                        isRetrying={keywordResearchMutation.isPending}
                        onRetry={
                            submittedSearch
                                ? () => {
                                      void handleSearch(submittedSearch);
                                  }
                                : undefined
                        }
                    />
                ) : (
                    <KeywordLandingState />
                )}
            </div>
        </div>
    );
}
