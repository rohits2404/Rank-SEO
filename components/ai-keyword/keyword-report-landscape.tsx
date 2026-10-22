import { KeywordReport } from "@/lib/keyword-report";
import {
    CheckCircle2Icon,
    FileStackIcon,
    TargetIcon,
    TriangleAlertIcon,
    TrophyIcon,
    ZapIcon,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { FeatureLock } from "../feature-lock";

export function KeywordReportLandscape({
    report,
    premiumLocked = false,
}: {
    report: KeywordReport;
    premiumLocked?: boolean;
}) {
    const opportunities = [
        {
            title: "What Strong Pages Do Well",
            icon: CheckCircle2Icon,
            items: report.contentOpportunity.patternsThatEarnCitations,
            iconClassName: "text-primary",
        },
        {
            title: "Missing Information",
            icon: TriangleAlertIcon,
            items: report.contentOpportunity.evidenceGaps,
            iconClassName: "text-destructive",
        },
        {
            title: "Fastest Opportunities",
            icon: ZapIcon,
            items: report.contentOpportunity.fastestOpportunities,
            iconClassName: "text-primary",
        },
    ];

    return (
        <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase">
                        Competitive Landscape
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tighter">
                        Who Shapes The Answer
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    The Sources And Competitors Shaping This Topic
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <Card size="sm" className="gap-0">
                    <CardHeader className="border-b">
                        <FileStackIcon className="size-5 text-primary" />
                        <CardTitle className="text-lg normal-case tracking-normal">
                            Source Mix
                        </CardTitle>
                        <CardDescription>
                            The Kinds Of Pages Represented Across The Research.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5 pt-5">
                        {report.sourceMix.map((source) => (
                            <div key={source.type}>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <span className="font-medium">
                                        {source.type}
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {source.count} · {source.share}%
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: `${source.share}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card size="sm" className="gap-0">
                    <CardHeader className="border-b">
                        <TrophyIcon className="size-5 text-primary" />
                        <CardTitle className="text-lg normal-case tracking-normal">
                            Competitors And Peers
                        </CardTitle>
                        <CardDescription>
                            Comparable Names Competing For The Same Topic.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-[minmax(0,1fr)_4rem_5rem_6rem] border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
                            <span>Competitor</span>
                            <span className="text-right">Mentions</span>
                            <span className="text-right">Share</span>
                            <span className="text-right">Strength</span>
                        </div>
                        {report.competitors.map((competitor) => (
                            <div
                                key={competitor.domain}
                                className="grid grid-cols-[minmax(0,1fr)_4rem_5rem_6rem] items-center border-b px-5 py-4 last:border-b-0"
                            >
                                <div className="min-w-0 pr-4">
                                    <p className="truncate font-semibold">
                                        {competitor.name}
                                    </p>
                                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${competitor.share}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-right font-semibold tabular-nums">
                                    {competitor.citations}
                                </span>
                                <span className="text-right text-muted-foreground tabular-nums">
                                    {competitor.share}%
                                </span>
                                <span
                                    className={
                                        competitor.citations === 0
                                            ? "text-right text-xs font-semibold text-muted-foreground"
                                            : "text-right text-xs font-semibold text-primary"
                                    }
                                >
                                    {competitor.citations === 0
                                        ? "Not Mentioned"
                                        : competitor.strength}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card size="sm" className="gap-0">
                <CardHeader className="border-b">
                    <TargetIcon className="size-5 text-primary" />
                    <CardTitle className="text-lg normal-case tracking-normal">
                        Content Opportunity
                    </CardTitle>
                    <CardDescription>
                        Practical Ways To Create A More Useful Page For This
                        Topic.
                    </CardDescription>
                </CardHeader>
                <FeatureLock
                    locked={premiumLocked}
                    title="Unlock Content Opportunities"
                    description="Upgrade To See Evidence Gaps, Citation Patterns, And The Fastest Content Opportunities."
                    className="min-h-72 rounded-none border-0"
                >
                    <CardContent className="grid p-0 md:grid-cols-3">
                        {opportunities.map((opportunity) => {
                            const Icon = opportunity.icon;
                            return (
                                <div
                                    key={opportunity.title}
                                    className="border-b p-5 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
                                >
                                    <h3 className="flex items-center gap-2 font-semibold">
                                        <Icon
                                            className={`size-4 ${opportunity.iconClassName}`}
                                            aria-hidden="true"
                                        />
                                        {opportunity.title}
                                    </h3>
                                    <ul className="mt-4 flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/80">
                                        {opportunity.items.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </CardContent>
                </FeatureLock>
            </Card>
        </section>
    );
}
