import "server-only";

import { runs } from "@trigger.dev/sdk";
import type { ReportStatus, ReportType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ProcessingReport = {
    id: string;
    type: ReportType;
    status: ReportStatus;
    triggerRunId: string | null;
    currentStep: string | null;
    errorMessage: string | null;
};

const failedRunStatuses = new Set([
    "CANCELED",
    "FAILED",
    "CRASHED",
    "SYSTEM_FAILURE",
    "EXPIRED",
    "TIMED_OUT",
]);

export async function reconcileTerminalReport<T extends ProcessingReport>(
    report: T,
): Promise<T> {
    const isProcessing =
        report.status === "PENDING" ||
        report.status === "COLLECTING" ||
        report.status === "ANALYZING";

    if (!isProcessing || !report.triggerRunId) return report;

    try {
        const run = await runs.retrieve(report.triggerRunId);

        if (!failedRunStatuses.has(run.status)) return report;

        const failure = getRunFailure(
            run.status,
            run.error?.message,
            report.type,
        );
        const updatedReport = await prisma.report.update({
            where: { id: report.id },
            data: {
                status: "FAILED",
                currentStep: failure.currentStep,
                errorMessage: failure.errorMessage,
            },
            select: {
                status: true,
                currentStep: true,
                errorMessage: true,
            },
        });

        return { ...report, ...updatedReport };
    } catch (error) {
        console.warn("Unable To Reconcile Report With Trigger.dev", {
            reportId: report.id,
            error: error instanceof Error ? error.message : "Unknown Error",
        });
        return report;
    }
}

function getRunFailure(
    runStatus: string,
    runError: string | undefined,
    reportType: ReportType,
) {
    if (runStatus === "CANCELED") {
        return {
            currentStep: "Report Generation Cancelled",
            errorMessage: "This Report Was Cancelled Before It Finished.",
        };
    }

    if (runStatus === "TIMED_OUT" || runStatus === "EXPIRED") {
        return {
            currentStep: "Report Generation Timed Out",
            errorMessage: "This Report timed Out Before It Finished.",
        };
    }

    return {
        currentStep:
            reportType === "KEYWORD"
                ? "Keyword Research Failed"
                : "AI Visibility Scan Failed",
        errorMessage: runError || `Trigger Run Ended With ${runStatus}`,
    };
}
