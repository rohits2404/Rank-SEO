import { cn } from "@/lib/utils";
import { ChartNoAxesCombined } from "lucide-react";
import Link from "next/link";

type SiteLogoProps = {
    className?: string;
    href?: string;
    inverted?: boolean;
};

export function Logo({
    className,
    href = "/",
    inverted = false,
}: SiteLogoProps) {
    return (
        <Link
            href={href}
            aria-label="RankSEO home"
            className={cn(
                "inline-flex items-center gap-2 text-lg font-bold tracking-tight",
                inverted ? "text-primary-foreground" : "text-foreground",
                className,
            )}
        >
            <span
                className={cn(
                    "flex size-7 items-center justify-center rounded-md",
                    inverted
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary text-primary-foreground",
                )}
            >
                <ChartNoAxesCombined className="size-4" strokeWidth={2.5} />
            </span>
            <span>
                Rank
                <span
                    className={
                        inverted ? "text-primary-foreground" : "text-primary"
                    }
                >
                    SEO
                </span>
            </span>
        </Link>
    );
}
