import { auth } from "@/lib/auth";
import { checkUsageLimit } from "@/lib/billing";
import { ReportStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { keywordResearchTask } from "@/trigger/keyword-research";
import { tasks } from "@trigger.dev/sdk";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const keywordResearchInputSchema = z.object({
    keyword: z.string().trim().min(2).max(120),
    country: z
        .string()
        .trim()
        .transform((country) => country.toUpperCase())
        .pipe(z.string().regex(/^[A-Z]{2}$/)),
});

export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requestBody = await request.json().catch(() => null);
    const input = keywordResearchInputSchema.safeParse(requestBody);

    if (!input.success) {
        return NextResponse.json(
            {
                message: "Enter A Valid Keyword And Two-Letter Country Code",
                errors: z.flattenError(input.error).fieldErrors,
            },
            { status: 400 },
        );
    }

    const usage = await checkUsageLimit(session.user.id, "keywordSearches");
    if (!usage.allowed) {
        return NextResponse.json(
            {
                message: "You Have Reached Your Keyword Research Limit.",
                code: "LIMIT_REACHED",
            },
            { status: 403 },
        );
    }

    const report = await prisma.report.create({
        data: {
            userId: session.user.id,
            type: "KEYWORD",
            status: ReportStatus.PENDING,
            progress: 5,
            currentStep: "Preparing Keyword Search",
            keyword: input.data.keyword,
            country: input.data.country,
        },
        select: {
            id: true,
            status: true,
            progress: true,
            currentStep: true,
        },
    });

    try {
        const handle = await tasks.trigger<typeof keywordResearchTask>(
            "keyword-research",
            {
                jobId: report.id,
                keyword: input.data.keyword,
                country: input.data.country,
            },
            {
                tags: [`report:${report.id}`, `user:${session.user.id}`],
            },
        );

        await prisma.report.update({
            where: {
                id: report.id,
            },
            data: {
                triggerRunId: handle.id,
            },
            select: {
                id: true,
            },
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
                        report.currentStep ?? "Preparing Keyword Search",
                },
            },
            { status: 202 },
        );
    } catch (error) {
        console.error("Failed To Start Keyword Research", {
            reportId: report.id,
            error,
        });

        await prisma.report.update({
            where: {
                id: report.id,
            },
            data: {
                status: ReportStatus.FAILED,
                currentStep: "Could Not Start Keyword Research",
                errorMessage: "The Keyword Research Job Could Not Be Started.",
            },
            select: {
                id: true,
            },
        });

        return NextResponse.json(
            { message: "Failed To Start Keyword Research" },
            { status: 500 },
        );
    }
}
