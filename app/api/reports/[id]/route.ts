import { auth as triggerAuth } from "@trigger.dev/sdk";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import type { KeywordReport } from "@/lib/keyword-report";
import { prisma } from "@/lib/prisma";
import { reconcileTerminalReport } from "@/lib/reports";
import type { ReportDetailResponse } from "@/types/reports";
import type { VisibilityReportResult } from "@/types/search-visibility";

const reportIdSchema = z.string().min(1);

type ReportRouteProps = {
    params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ReportRouteProps) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reportId = reportIdSchema.safeParse((await params).id);
    if (!reportId.success) {
        return NextResponse.json(
            { message: "Report Not Found" },
            { status: 404 },
        );
    }

    const reportRow = await prisma.report.findFirst({
        where: {
            id: reportId.data,
            userId: session.user.id,
        },
        select: {
            id: true,
            type: true,
            status: true,
            keyword: true,
            language: true,
            country: true,
            website: true,
            brand: true,
            topic: true,
            progress: true,
            currentStep: true,
            triggerRunId: true,
            result: true,
            errorMessage: true,
            createdAt: true,
            completedAt: true,
        },
    });

    if (!reportRow) {
        return NextResponse.json(
            { message: "Report Not Found" },
            { status: 404 },
        );
    }

    const report = await reconcileTerminalReport(reportRow);
    const isKeywordReport = report.type === "KEYWORD";
    const status =
        report.status === "COMPLETED"
            ? "completed"
            : report.status === "FAILED"
              ? "failed"
              : "processing";

    const response: ReportDetailResponse = {
        report: {
            id: report.id,
            type: isKeywordReport ? "keyword" : "visibility",
            status,
            title: isKeywordReport
                ? report.keyword?.trim() || "Untitled Keyword Report"
                : report.brand?.trim() ||
                  report.website?.trim() ||
                  "Untitled Visibility Report",
            description: isKeywordReport
                ? `${report.language?.trim() || "English"} · ${report.country?.trim() || "—"}`
                : report.topic?.trim() ||
                  report.website?.trim() ||
                  "AI Visibility Scan",
            progress: Math.min(100, Math.max(0, report.progress)),
            currentStep: report.currentStep || "Preparing Report",
            errorMessage: report.errorMessage,
            triggerRunId: report.triggerRunId,
            keyword: report.keyword,
            visibilitySearch:
                !isKeywordReport &&
                report.website &&
                report.brand &&
                report.topic
                    ? {
                          website: report.website,
                          brand: report.brand,
                          topic: report.topic,
                      }
                    : null,
            result: isKeywordReport
                ? (report.result as KeywordReport | null)
                : null,
            visibilityResult: !isKeywordReport
                ? (report.result as VisibilityReportResult | null)
                : null,
            createdAt: report.createdAt.toISOString(),
            completedAt: report.completedAt?.toISOString() ?? null,
        },
    };

    if (status === "processing" && report.triggerRunId) {
        response.realtimeAccessToken = await triggerAuth.createPublicToken({
            scopes: { read: { runs: report.triggerRunId } },
            expirationTime: "1h",
        });
    }

    return NextResponse.json(response, {
        headers: { "Cache-Control": "private, no-store" },
    });
}
