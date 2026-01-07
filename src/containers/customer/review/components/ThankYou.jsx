import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const ThankYou = ({ merchantConfig }) => {
    return (
        <div className="w-full">
            <Card className="w-full border-muted/60 shadow-lg text-center overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Thank You!
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Working with you was a pleasure
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 pb-10">
                    <div className="bg-muted/30 rounded-2xl p-6 border border-muted/60">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Your feedback helps us serve you better. We hope to see you again soon
                            at <span className="font-bold text-foreground">{merchantConfig.name}</span>.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            className="w-full h-12 text-base font-bold shadow-md transition-all active:scale-95"
                            onClick={() => window.location.reload()}
                        >
                            Submit Another Review
                        </Button>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            QR Tenants Platform
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
