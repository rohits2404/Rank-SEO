import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcileTerminalReport } from "@/lib/reports";
import type { ReportListItem, ReportListStatus } from "@/types/reports";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reportRows = await prisma.report.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 100,
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
            errorMessage: true,
            createdAt: true,
            completedAt: true,
        },
    });

    const reconciledReports = await Promise.all(
        reportRows.map(reconcileTerminalReport),
    );

    const reports: ReportListItem[] = reconciledReports.map((report) => {
        const isKeywordReport = report.type === "KEYWORD";

        return {
            id: report.id,
            type: isKeywordReport ? "keyword" : "visibility",
            status: toReportListStatus(report.status),
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
            createdAt: report.createdAt.toISOString(),
            completedAt: report.completedAt?.toISOString() ?? null,
        };
    });

    return NextResponse.json(
        { reports },
        {
            headers: {
                "Cache-Control": "private, no-store",
            },
        },
    );
}

function toReportListStatus(status: string): ReportListStatus {
    if (status === "COMPLETED") return "completed";
    if (status === "FAILED") return "failed";
    return "processing";
}
