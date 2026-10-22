"use client";

import { useBilling } from "@/hooks/use-billing";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "./logo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { GaugeIcon, LogOutIcon, MenuIcon, MoonIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Switch } from "./ui/switch";

const navigationItems = [
    { title: "AI Keyword Research", href: "/ai-keyword" },
    { title: "AI Search Visibility", href: "/ai-search-visibility" },
    { title: "All Reports", href: "/reports" },
    { title: "Plan & Billing", href: "/billing" },
];

type DashboardUser = {
    name: string;
    email: string;
    image?: string | null;
};

export function DashboardNavbar({ user }: { user: DashboardUser }) {
    const pathname = usePathname();
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const billing = useBilling();
    const initials = user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    async function handleSignOut() {
        const { error } = await authClient.signOut();

        if (error) {
            toast.error(error.message || "We Could Not Sign You Out.");
            return;
        }

        router.replace("/auth/sign-in");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
                <Logo href="/ai-keyword" />

                <div className="mx-5 hidden h-8 w-px bg-border lg:block" />

                <nav
                    aria-label="Dashboard navigation"
                    className="hidden h-full items-center lg:flex"
                >
                    {navigationItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "relative flex h-full items-center px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                                    isActive &&
                                        "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-primary",
                                )}
                            >
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    {billing.data && (
                        <Badge
                            render={<Link href="/billing" />}
                            variant={
                                billing.data.usage.keywordSearches.remaining <=
                                1
                                    ? "destructive"
                                    : "default"
                            }
                            className={cn(
                                "hidden rounded-full border px-3 py-1.5 text-xs tracking-normal normal-case xl:inline-flex",
                                billing.data.usage.keywordSearches.remaining <=
                                    1
                                    ? "border-destructive/20 bg-destructive/10"
                                    : "border-primary/20 bg-primary/10 text-primary",
                            )}
                            aria-label={`${billing.data.usage.keywordSearches.remaining} keyword searches and ${billing.data.usage.visibilityScans.remaining} visibility scans remaining`}
                        >
                            <GaugeIcon aria-hidden="true" />
                            {billing.data.usage.keywordSearches.remaining}{" "}
                            Keywords ·{" "}
                            {billing.data.usage.visibilityScans.remaining} Scans
                        </Badge>
                    )}

                    {!billing.isLoading &&
                        billing.data &&
                        !billing.data.isPaid && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden border-primary/30 text-primary lg:inline-flex"
                                render={<Link href="/billing" />}
                                nativeButton={false}
                            >
                                Upgrade To Pro
                            </Button>
                        )}

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Open dashboard navigation"
                                    className="lg:hidden"
                                />
                            }
                        >
                            <MenuIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={10}
                            className="w-64"
                        >
                            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                            <div className="flex flex-col py-1">
                                {navigationItems.map((item) => {
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                                                isActive &&
                                                    "bg-primary/10 text-primary",
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    );
                                })}
                                <span className="px-3 py-2 text-sm font-medium text-muted-foreground">
                                    Apps &amp; Integrations
                                </span>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    type="button"
                                    className="rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label="Open user menu"
                                />
                            }
                        >
                            <Avatar className="size-9">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {initials || "RS"}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            sideOffset={10}
                            className="w-64"
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="normal-case tracking-normal">
                                    <span className="flex min-w-0 flex-col gap-1">
                                        <span className="truncate text-sm font-semibold text-foreground">
                                            {user.name}
                                        </span>
                                        <span className="truncate font-normal text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </span>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <div className="flex items-center gap-3 px-3 py-2">
                                <MoonIcon
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                <span className="text-xs font-medium tracking-wider uppercase">
                                    Dark Mode
                                </span>
                                <Switch
                                    className="ml-auto"
                                    size="sm"
                                    checked={resolvedTheme === "dark"}
                                    onCheckedChange={(checked) =>
                                        setTheme(checked ? "dark" : "light")
                                    }
                                    aria-label="Toggle dark mode"
                                />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOutIcon />
                                Log Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
