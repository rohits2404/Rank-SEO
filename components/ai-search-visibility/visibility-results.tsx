"use client";

import { VisibilityReportResult } from "@/types/search-visibility";
import { VisibilitySearchValues } from "./visibility-search-form";
import { useBilling } from "@/hooks/use-billing";
import {
    ArrowUpRightIcon,
    BotIcon,
    CheckCircle2Icon,
    CircleAlertIcon,
    ExternalLinkIcon,
    MessageSquareTextIcon,
    SparklesIcon,
    TrophyIcon,
    UsersRoundIcon,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { FeatureLock } from "../feature-lock";

type VisibilityResultsProps = {
    report: VisibilityReportResult;
    search: VisibilitySearchValues;
};

function getVisibilityScoreTone(score: number) {
    if (score < 30) {
        return {
            label: "Low",
            badge: "text-destructive",
            icon: "bg-destructive/10 text-destructive",
            text: "text-destructive",
            bar: "bg-destructive",
        };
    }

    if (score < 60) {
        return {
            label: "Moderate",
            badge: "text-warning-foreground",
            icon: "bg-warning/15 text-warning-foreground",
            text: "text-warning-foreground",
            bar: "bg-warning",
        };
    }

    return {
        label: score >= 85 ? "Dominant" : "Strong",
        badge: "text-primary",
        icon: "bg-primary/10 text-primary",
        text: "text-primary",
        bar: "bg-primary",
    };
}

export function VisibilityResults({ report, search }: VisibilityResultsProps) {
    const billing = useBilling();
    const premiumLocked = billing.data?.isPaid !== true;
    const websiteHost = new URL(search.website).hostname.replace(/^www\./, "");
    const overallTone = getVisibilityScoreTone(report.overallScore);
    const metrics = [
        {
            label: "AI Visibility Score",
            value: `${report.overallScore}/100`,
            icon: SparklesIcon,
            tone: overallTone,
        },
        {
            label: "Brand Mentions",
            value: String(report.overview.brandMentions),
            icon: MessageSquareTextIcon,
        },
        {
            label: "Website Citations",
            value: String(report.overview.websiteCitations),
            icon: ExternalLinkIcon,
        },
        {
            label: "Competitors Found",
            value: String(report.overview.competitorsFound),
            icon: UsersRoundIcon,
        },
    ];

    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-primary">
                        Visibility Report
                    </p>
                    <h2 className="text-3xl font-black tracking-tighter">
                        {search.brand} In AI Search
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Topic: {search.topic} · Website: {websiteHost}
                    </p>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2Icon
                        className="size-4 text-primary"
                        aria-hidden="true"
                    />
                    {report.overview.promptsChecked} Prompts Checked
                </p>
            </div>

            <Card size="sm" className="rounded-xl border shadow-none ring-0">
                <CardHeader className="border-b">
                    <CardTitle className="text-lg tracking-normal normal-case">
                        Visibility Overview
                    </CardTitle>
                    <CardDescription>
                        Your Key Results And Performance Across Each AI
                        Platform.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-0 p-0 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="flex flex-col px-5 py-2">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div
                                    key={metric.label}
                                    className="flex items-center gap-3 border-b py-4 last:border-b-0"
                                >
                                    <span
                                        className={cn(
                                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                            metric.tone?.icon ??
                                                "bg-primary/10 text-primary",
                                        )}
                                    >
                                        <Icon
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                                        {metric.label}
                                    </span>
                                    {metric.tone && (
                                        <Badge className={metric.tone.badge}>
                                            {metric.tone.label}
                                        </Badge>
                                    )}
                                    <span
                                        className={cn(
                                            "text-lg font-bold tracking-tight tabular-nums",
                                            metric.tone?.text,
                                        )}
                                    >
                                        {metric.value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col border-t px-5 py-2 lg:border-t-0 lg:border-l">
                        {report.platformResults.map((result) => {
                            const tone = getVisibilityScoreTone(result.score);

                            return (
                                <div
                                    key={result.platform}
                                    className="flex flex-col gap-3 border-b py-4 last:border-b-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                "flex size-9 shrink-0 items-center justify-center rounded-full",
                                                tone.icon,
                                            )}
                                        >
                                            <BotIcon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                {result.platform}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {result.mentions} Of{" "}
                                                {result.promptsChecked} Mentions
                                                · {result.citations} Citations
                                            </span>
                                        </span>
                                        <Badge className={tone.badge}>
                                            {tone.label}
                                        </Badge>
                                        <span
                                            className={cn(
                                                "text-lg font-bold tabular-nums",
                                                tone.text,
                                            )}
                                        >
                                            {result.score}%
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                "h-full rounded-full",
                                                tone.bar,
                                            )}
                                            style={{
                                                width: `${Math.min(100, Math.max(0, result.score))}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid items-start gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                <Card
                    size="sm"
                    className="rounded-xl border shadow-none ring-0"
                >
                    <CardHeader className="border-b">
                        <CardTitle className="text-lg tracking-normal normal-case">
                            Prompt Visibility
                        </CardTitle>
                        <CardDescription>
                            See Where {search.brand} Appeared And Where An
                            Opportunity Is Still Open.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-0">
                        {report.promptResults.map((result) => (
                            <div
                                key={result.prompt}
                                className="grid gap-2 border-b py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_8rem_6rem] md:items-center"
                            >
                                <div className="flex min-w-0 flex-col gap-1">
                                    <p className="text-sm font-medium leading-relaxed">
                                        {result.prompt}
                                    </p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        {result.evidence}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {result.platforms.length > 0
                                        ? result.platforms.join(", ")
                                        : "No Platform"}
                                </p>
                                <span
                                    className={cn(
                                        "text-xs font-semibold",
                                        result.status === "Mentioned"
                                            ? "text-primary"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {result.status}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card
                    size="sm"
                    className="rounded-xl border shadow-none ring-0"
                >
                    <CardHeader className="border-b">
                        <TrophyIcon
                            className="size-5 text-primary"
                            aria-hidden="true"
                        />
                        <CardTitle className="text-lg tracking-normal normal-case">
                            Competitor Visibility
                        </CardTitle>
                        <CardDescription>
                            Brands Mentioned Along Side {search.brand}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-0">
                        {report.competitors.map((competitor, index) => (
                            <div
                                key={`${competitor.name}-${index}`}
                                className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b py-4 last:border-b-0"
                            >
                                <span className="text-xs font-semibold text-primary">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="flex min-w-0 flex-col gap-0.5">
                                    <span className="truncate text-sm font-semibold">
                                        {competitor.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {competitor.mentions} Mentions
                                    </span>
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {competitor.score}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card
                size="sm"
                className="rounded-xl border border-primary bg-primary/5 shadow-none ring-0"
            >
                <CardHeader>
                    <CircleAlertIcon
                        className="size-5 text-primary"
                        aria-hidden="true"
                    />
                    <CardTitle className="text-lg tracking-normal normal-case">
                        How To Improve Your Score
                    </CardTitle>
                    <CardDescription>
                        {premiumLocked
                            ? "Unlock Tailored Actions For Improving Your AI Visibility."
                            : report.summary}
                    </CardDescription>
                </CardHeader>
                <FeatureLock
                    locked={premiumLocked}
                    title="Unlock Improvement Actions"
                    description="Upgrade To See Recommendations That Can Increase Your Brand's Visibility In AI Answers."
                    className="min-h-64 rounded-none border-0"
                >
                    <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {report.recommendations.map((recommendation) => (
                            <div
                                key={recommendation}
                                className="flex items-start gap-3 rounded-lg border border-primary/20 bg-background p-4"
                            >
                                <ArrowUpRightIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                                <p className="text-sm leading-relaxed">
                                    {recommendation}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </FeatureLock>
            </Card>
        </section>
    );
}
