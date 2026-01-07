import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const RedirectWait = ({ nextStep }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            nextStep();
        }, 4000);
        return () => clearTimeout(timer);
    }, [nextStep]);

    return (
        <div className="w-full">
            <Card className="w-full border-muted/60 shadow-lg text-center overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Completing Step
                    </CardTitle>
                    <CardDescription className="text-sm">
                        One moment while we verify your feedback
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pb-12">
                    <div className="relative pt-2">
                        {/* Fallback internal progress animation if global CSS missing */}
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse transition-all duration-[4s]" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
                        Verifying redirected review...
                    </p>

                    <div className="bg-muted/30 p-4 rounded-xl border border-muted/60">
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                            Verification helps us ensure you get your reward!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
