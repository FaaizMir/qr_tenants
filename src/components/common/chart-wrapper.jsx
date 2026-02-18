import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartWrapper({ title, children, actions, className }) {
    return (
        <Card className={cn("border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                {actions && <div className="flex gap-2">{actions}</div>}
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {children || (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Chart placeholder - integrate with chart library
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
