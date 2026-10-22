import { tasks } from "@trigger.dev/sdk";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ReportStatus } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import { checkUsageLimit } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { visibilitySearchSchema } from "@/lib/search-visibility-schema";
import type { searchVisibilityTask } from "@/trigger/search-visibility";

export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json().catch(() => null);
    const input = visibilitySearchSchema.safeParse(requestBody);
    if (!input.success) {
        return NextResponse.json(
            {
                message: "Enter a Valid Website, Brand, And Topic",
                errors: z.flattenError(input.error).fieldErrors,
            },
            { status: 400 },
        );
    }

    const usage = await checkUsageLimit(session.user.id, "visibilityScans");
    if (!usage.allowed) {
        return NextResponse.json(
            {
                message: "You Have Reached Your AI Visibility Scan Limit.",
                code: "LIMIT_REACHED",
            },
            { status: 403 },
        );
    }

    const report = await prisma.report.create({
        data: {
            userId: session.user.id,
            type: "VISIBILITY",
            status: ReportStatus.PENDING,
            progress: 5,
            currentStep: "Preparing Visibility Scan",
            website: input.data.website,
            brand: input.data.brand,
            topic: input.data.topic,
        },
        select: {
            id: true,
            status: true,
            progress: true,
            currentStep: true,
        },
    });

    try {
        const handle = await tasks.trigger<typeof searchVisibilityTask>(
            "search-visibility",
            {
                jobId: report.id,
                website: input.data.website,
                brand: input.data.brand,
                topic: input.data.topic,
            },
            {
                tags: [`report:${report.id}`, `user:${session.user.id}`],
            },
        );

        await prisma.report.update({
            where: { id: report.id },
            data: { triggerRunId: handle.id },
            select: { id: true },
        });

        return NextResponse.json(
            {
                jobId: report.id,
                runId: handle.id,
                publicAccessToken: handle.publicAccessToken,
                report: {
                    status: report.status,
                    progress: report.progress,
                    currentStep:
                        report.currentStep ?? "Preparing Visibility Scan",
                },
            },
            { status: 202 },
        );
    } catch (error) {
        console.error("Failed To Start AI Visibility Scan", {
            reportId: report.id,
            error,
        });

        await prisma.report.update({
            where: { id: report.id },
            data: {
                status: ReportStatus.FAILED,
                currentStep: "Could Not Start AI Visibility Scan",
                errorMessage: "The AI Visibility Job Could Not Be Started.",
            },
            select: { id: true },
        });

        return NextResponse.json(
            { message: "Failed To Start AI Visibility Scan" },
            { status: 500 },
        );
    }
}
