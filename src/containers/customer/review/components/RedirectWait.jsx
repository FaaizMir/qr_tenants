import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const RedirectWait = ({ nextStep }) => {
    useEffect(() => {
        // Simulate user returning from review
        const timer = setTimeout(() => {
            nextStep();
        }, 3000);
        return () => clearTimeout(timer);
    }, [nextStep]);

    return (
        <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Checking your review...</h2>
                <p className="text-muted-foreground">
                    Please wait while we verify your submission.
                </p>
            </div>
        </div>
    );
};
