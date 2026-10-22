import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import Image from "next/image";

const keywordBenefits = [
    {
        title: "Research AI Prompts And Responses",
        description:
            "AI Searches Are Growing Fast. Stay Relevant By Seeing What Your Audience Is Asking.",
        image: "/images/ai-ui-illustration.png",
        imageAlt: "AI Prompts, Brand Mentions, And Response Insights Preview",
        background: "bg-primary/5",
    },
    {
        title: "Find Secret SEO Gems",
        description:
            "Discover Related Searches, Audience Questions, Ranking Pages, And Content Gaps From Live Search Results.",
        image: "/images/search-ui-illustration.png",
        imageAlt: "Search Opportunities And Related Keyword Preview",
        background: "bg-secondary",
    },
    {
        title: "Optimize For Search Intent",
        description:
            "Focus On Useful Topics That Match Informational, Commercial, Transactional, And Navigational Intent.",
        image: "/images/search-intent-block.png",
        imageAlt:
            "Informational, Commercial, Transactional, And Navigational Intent",
        background: "bg-muted",
    },
    {
        title: "Master Local Search",
        description:
            "Research Location-Based Searches To Reach The Right Audience And Attract More Customers.",
        image: "/images/dropdown-ui-illustration.png",
        imageAlt: "Local Keyword Location Selection Preview",
        background: "bg-accent",
    },
];

export function KeywordLandingState() {
    return (
        <section className="space-y-4 pb-10">
            <h1 className="text-2xl font-semibold tracking-tight">
                AI-Powered Keyword Research
            </h1>

            <div className="grid gap-5 lg:grid-cols-2">
                {keywordBenefits.map((benefit) => (
                    <Card
                        key={benefit.title}
                        className="min-h-100 gap-3 border py-7 shadow-none ring-0 [--card-spacing:--spacing(6)]"
                    >
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold tracking-tight normal-case">
                                {benefit.title}
                            </CardTitle>
                            <CardDescription className="max-w-xl text-base">
                                {benefit.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-1">
                            <div className="relative flex min-h-64 w-full items-center justify-center overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute size-64 rounded-full sm:size-72",
                                        benefit.background,
                                    )}
                                    aria-hidden="true"
                                />
                                <Image
                                    src={benefit.image}
                                    alt={benefit.imageAlt}
                                    width={564}
                                    height={322}
                                    sizes="(min-width: 1024px) 40vw, 80vw"
                                    className="relative z-10 h-56 w-[78%] object-contain"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
