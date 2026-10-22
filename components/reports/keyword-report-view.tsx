"use client";

import { useBilling } from "@/hooks/use-billing";
import { KeywordReport } from "@/lib/keyword-report";
import { KeywordReportSummary } from "../ai-keyword/keyword-report-summary";
import { KeywordReportLandscape } from "../ai-keyword/keyword-report-landscape";
import { KeywordReportOpportunities } from "../ai-keyword/keyword-report-opportunities";

type KeywordReportViewProps = {
    keyword: string;
    report: KeywordReport;
};

export function KeywordReportView({ keyword, report }: KeywordReportViewProps) {
    const billing = useBilling();
    const premiumLocked = billing.data?.isPaid !== true;

    return (
        <div className="flex flex-col gap-8 pb-8">
            <KeywordReportSummary
                keyword={keyword}
                report={report}
                premiumLocked={premiumLocked}
            />
            <KeywordReportLandscape
                report={report}
                premiumLocked={premiumLocked}
            />
            <KeywordReportOpportunities report={report} />
        </div>
    );
}
