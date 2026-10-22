"use client";

import { LiveVisibilityProgress } from "@/components/ai-search-visibility/live-visibility-progress";
import { VisibilityResults } from "@/components/ai-search-visibility/visibility-results";
import { KeywordReportView } from "@/components/reports/keyword-report-view";
import { LiveReportProgress } from "@/components/reports/live-report-progress";
import { ReportFailed } from "@/components/reports/report-failed";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ReportDetailResponse } from "@/types/reports";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeftIcon,
    BarChart3Icon,
    CalendarIcon,
    SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback } from "react";

async function fetchReport(reportId: string): Promise<ReportDetailResponse> {
    const response = await fetch(`/api/reports/${reportId}`);
    const body = (await response.json().catch(() => null)) as
        ReportDetailResponse | { message?: string } | null;

    if (!response.ok || !body || !("report" in body)) {
        throw new Error(
            body && "message" in body && body.message
                ? body.message
                : "Unable To Load Report",
        );
    }

    return body;
}

export function Reports() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const reportQuery = useQuery({
        queryKey: ["reports", id],
        queryFn: () => fetchReport(id),
        enabled: Boolean(id),
        refetchInterval: (query) =>
            query.state.data?.report.status === "processing" ? 3_000 : false,
    });

    const refreshReport = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["reports", id] });
        void queryClient.invalidateQueries({ queryKey: ["reports"] });
    }, [id, queryClient]);

    if (reportQuery.isPending) {
        return (
            <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Loading Report...
            </div>
        );
    }

    if (reportQuery.isError) {
        return (
            <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
                <ReportFailed errorMessage={reportQuery.error.message} />
            </div>
        );
    }

    const { report, realtimeAccessToken } = reportQuery.data;

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:px-8">
            <div className="flex flex-col gap-5">
                <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href="/reports" />}
                    nativeButton={false}
                    className="w-fit tracking-normal"
                >
                    <ArrowLeftIcon data-icon="inline-start" />
                    All Reports
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex items-center gap-2 text-sm tracking-normal normal-case">
                            {report.type === "keyword" ? (
                                <SearchIcon
                                    className="size-3.5"
                                    data-icon="inline-start"
                                />
                            ) : (
                                <BarChart3Icon
                                    className="size-3.5"
                                    data-icon="inline-start"
                                />
                            )}
                            {report.type === "keyword"
                                ? "Keyword Research"
                                : "AI Visibility"}
                        </span>

                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarIcon
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            {formatReportDate(report.createdAt)}
                        </span>
                    </div>

                    {report.completedAt && (
                        <p className="text-xs text-muted-foreground">
                            Completed {formatReportDate(report.completedAt)}
                        </p>
                    )}
                </div>
            </div>

            {report.type === "visibility" && report.status === "failed" ? (
                <ReportFailed errorMessage={report.errorMessage} />
            ) : report.type === "visibility" &&
              report.status === "completed" ? (
                report.visibilitySearch && report.visibilityResult ? (
                    <VisibilityResults
                        search={report.visibilitySearch}
                        report={report.visibilityResult}
                    />
                ) : (
                    <ReportFailed errorMessage="This visibility report completed without a saved result." />
                )
            ) : report.type === "visibility" &&
              report.triggerRunId &&
              realtimeAccessToken ? (
                <LiveVisibilityProgress
                    initialProgress={{
                        status: "PENDING",
                        progress: report.progress,
                        currentStep: report.currentStep,
                    }}
                    runId={report.triggerRunId}
                    accessToken={realtimeAccessToken}
                    onComplete={refreshReport}
                />
            ) : report.type === "visibility" ? (
                <ReportFailed errorMessage="This visibility report cannot reconnect to its live run." />
            ) : report.status === "failed" ? (
                <ReportFailed errorMessage={report.errorMessage} />
            ) : report.status === "completed" ? (
                report.keyword && report.result ? (
                    <KeywordReportView
                        keyword={report.keyword}
                        report={report.result}
                    />
                ) : (
                    <ReportFailed errorMessage="This keyword report completed without a saved result." />
                )
            ) : report.triggerRunId && realtimeAccessToken ? (
                <LiveReportProgress
                    keyword={report.keyword || report.title}
                    initialProgress={{
                        status: "PENDING",
                        progress: report.progress,
                        currentStep: report.currentStep,
                    }}
                    runId={report.triggerRunId}
                    accessToken={realtimeAccessToken}
                    onComplete={refreshReport}
                />
            ) : (
                <ReportFailed errorMessage="This keyword report cannot reconnect to its live run." />
            )}
        </div>
    );
}

function formatReportDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
