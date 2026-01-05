import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThankYou = ({ merchantConfig }) => {
    return (
        <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-blue-900">
                    Thanks for Reviewing!
                </h2>
                <p className="text-muted-foreground">
                    Your feedback helps us serve you better. We hope to see you again soon
                    at <b>{merchantConfig.name}</b>.
                </p>
            </div>
            <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.reload()}
            >
                Submit Another Review
            </Button>
        </div>
    );
};
