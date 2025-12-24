import { Card, CardContent } from "@/components/ui/card";
import { Layers, CheckCircle, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditsOverview({ data }) {
    const { totalIssued, totalRedeemed, remainingCredits, creditsUsed } = data;

    const metrics = [
        {
            label: "Total Coupons Issued",
            value: totalIssued,
            icon: Layers,
            color: "text-blue-600 dark:text-blue-400",
            bgClass: "from-blue-50 to-white dark:from-blue-950/50 dark:to-background border-blue-200 dark:border-blue-900",
            iconBg: "bg-blue-100 dark:bg-blue-900",
            description: "Total potential redemptions",
        },
        {
            label: "Total Redeemed",
            value: totalRedeemed,
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400",
            bgClass: "from-green-50 to-white dark:from-green-950/50 dark:to-background border-green-200 dark:border-green-900",
            iconBg: "bg-green-100 dark:bg-green-900",
            description: "Successfully processed",
        },
        {
            label: "Remaining Credits",
            value: remainingCredits,
            icon: Wallet,
            color: "text-purple-600 dark:text-purple-400",
            bgClass: "from-purple-50 to-white dark:from-purple-950/50 dark:to-background border-purple-200 dark:border-purple-900",
            iconBg: "bg-purple-100 dark:bg-purple-900",
            description: "Available for usage",
        },
        {
            label: "Credits Used",
            value: creditsUsed,
            icon: TrendingUp,
            color: "text-orange-600 dark:text-orange-400",
            bgClass: "from-orange-50 to-white dark:from-orange-950/50 dark:to-background border-orange-200 dark:border-orange-900",
            iconBg: "bg-orange-100 dark:bg-orange-900",
            description: "Consumed credit usage",
        },
    ];

    return (
        <div className="space-y-4 mb-8">
            <div className="flex flex-col space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight">Credits Overview</h2>
                <p className="text-muted-foreground">
                    Track usage and remaining credits across all coupon batches.
                </p>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {metrics.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Card
                            key={index}
                            className={cn(
                                "overflow-hidden border transition-all duration-200 hover:shadow-md bg-gradient-to-br",
                                item.bgClass
                            )}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-full", item.iconBg)}>
                                        <Icon className={cn("w-6 h-6", item.color)} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {item.value?.toLocaleString() ?? 0}
                                        </h3>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
