import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Ribbon, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import BatchSelector from "./BatchSelector";

export default function RewardStrategySettings({
    config,
    setConfig,
    couponBatches,
    loadingBatches,
}) {
    const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);

    return (
        <Card className="border-muted/40 shadow-sm h-fit">
            <CardHeader className="pb-6 border-b border-muted/20">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Ribbon className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold">
                            Reward Strategy
                        </CardTitle>
                        <CardDescription>
                            Choose how to reward your customers
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {/* Lucky Draw Option */}
                <div
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${config.luckyDrawEnabled
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/30"
                        }`}
                    onClick={() => setConfig(prev => ({ ...prev, luckyDrawEnabled: true }))}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg ${config.luckyDrawEnabled
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Lucky Draw</p>
                                <p className="text-xs text-muted-foreground">
                                    Gamified chance to win
                                </p>
                            </div>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.luckyDrawEnabled ? "border-primary" : "border-muted"
                                }`}
                        >
                            {config.luckyDrawEnabled && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                        </div>
                    </div>
                    {config.luckyDrawEnabled && (
                        <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-start gap-1">
                            <span className="mt-0.5">💡</span> Configure prizes in the
                            <Link
                                href="/merchant/lucky-draw"
                                className="font-semibold underline underline-offset-2 hover:text-orange-800 transition-colors"
                            >
                                Lucky Draw tab
                            </Link>
                            .
                        </div>
                    )}
                </div>

                {/* Direct Coupon Option */}
                <div
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${!config.luckyDrawEnabled
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/30"
                        }`}
                    onClick={() => setConfig(prev => ({ ...prev, luckyDrawEnabled: false }))}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-lg ${!config.luckyDrawEnabled
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <Ticket className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Direct Coupon</p>
                                <p className="text-xs text-muted-foreground">
                                    Guaranteed reward via WhatsApp
                                </p>
                            </div>
                        </div>
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!config.luckyDrawEnabled ? "border-primary" : "border-muted"
                                }`}
                        >
                            {!config.luckyDrawEnabled && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                        </div>
                    </div>

                    {!config.luckyDrawEnabled && (
                        <div
                            className="mt-4 animate-in fade-in slide-in-from-top-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Label className="text-xs font-medium mb-1.5 block">
                                Select Coupon Batch <span className="text-red-500">*</span>
                            </Label>
                            <BatchSelector
                                selectedId={config.selectedBatchId}
                                batches={couponBatches}
                                isOpen={batchDropdownOpen}
                                setIsOpen={setBatchDropdownOpen}
                                onSelect={(id) => setConfig(prev => ({ ...prev, selectedBatchId: id }))}
                                loading={loadingBatches}
                                placeholder="Choose regular reward..."
                            />
                            {!config.selectedBatchId && (
                                <p className="text-[10px] text-red-500 mt-1.5 font-medium flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                                    Required for Direct Coupon
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
