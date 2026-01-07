import React from "react";
import { CheckCircle2, MessageSquare, Gift, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const RewardSuccess = ({ reward, formValues }) => {
    return (
        <div className="w-full">
            <Card className="w-full border-muted/60 shadow-lg text-center overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-green-600">
                        Success!
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Your reward is ready for collection
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pb-10">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Check WhatsApp
                        </Badge>
                        <p className="text-muted-foreground text-sm">
                            Sent to <span className="font-bold text-foreground">{formValues.phone}</span>
                        </p>
                    </div>

                    <div className="relative p-6 rounded-2xl bg-primary/5 border-2 border-dashed border-primary/20 overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Gift className="w-16 h-16 -rotate-12" />
                        </div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Unique Reward</p>
                            <h3 className="text-3xl font-black text-primary tracking-tight">
                                {reward?.name || "Special Offer"}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-left p-4 rounded-xl bg-muted/30 border border-muted/60">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 border border-muted/40">
                            <QrCode className="w-7 h-7 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-foreground">Redemption Ready</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Simply show the WhatsApp message to our staff to redeem your gift!
                            </p>
                        </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground italic">
                        * Powered by QR Tenants Experience
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
