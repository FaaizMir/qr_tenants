"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PageTabs({ tabs, defaultTab, paramName = "tab" }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get tab from URL or use default
    const activeTab = searchParams.get(paramName) || defaultTab || tabs[0]?.value;

    const handleTabChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramName, value);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList className="mb-6 h-11 items-center justify-start rounded-lg bg-muted/50 p-1 w-fit border border-border/50">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="h-9 px-5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
}
