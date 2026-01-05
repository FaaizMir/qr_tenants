import React from "react";
import { CheckCircle2, MessageSquare, Gift, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

export const RewardSuccess = ({ reward, formValues }) => {
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-green-700">
                        Sent to WhatsApp!
                    </h2>
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        <MessageSquare className="w-3 h-3 mr-1" /> Check your phone
                    </Badge>
                </div>
                <p className="text-muted-foreground px-4">
                    We have sent your <b>{reward?.name || "Discount Code"}</b> directly to:
                    <span className="font-semibold block text-foreground mt-1 text-lg">
                        {formValues.phone}
                    </span>
                </p>
            </div>

            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                    <Gift className="w-12 h-12 text-primary" />
                    <div className="text-center space-y-1">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                            Your Reward
                        </p>
                        <h3 className="text-2xl font-bold text-primary">
                            {reward?.name || "Special Offer"}
                        </h3>
                    </div>
                    <div className="w-full h-px bg-border"></div>
                    <div className="flex items-center gap-3 text-sm text-left text-muted-foreground w-full bg-white p-3 rounded border">
                        <QrCode className="w-8 h-8 text-primary shrink-0" />
                        <div>
                            <p className="font-semibold text-foreground">
                                Strictly No Copying
                            </p>
                            <p className="text-xs">
                                Your unique redemption QR code is waiting in your WhatsApp chat.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-muted p-4 rounded-lg flex items-start gap-3 text-sm">
                <div className="mt-0.5">ℹ️</div>
                <p>
                    Simply show the WhatsApp message to our staff to redeem your reward. No
                    need to copy codes!
                </p>
            </div>
        </div>
    );
};
