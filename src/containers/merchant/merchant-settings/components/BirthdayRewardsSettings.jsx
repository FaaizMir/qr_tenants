import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Cake } from "lucide-react";
import BatchSelector from "./BatchSelector";

export default function BirthdayRewardsSettings({
    config,
    setConfig,
    couponBatches,
    loadingBatches,
}) {
    const [birthdayBatchDropdownOpen, setBirthdayBatchDropdownOpen] =
        useState(false);

    return (
        <Card className="border-muted/40 shadow-sm h-fit">
            <CardHeader className="pb-6 border-b border-muted/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                            <Cake className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                Birthday Club
                            </CardTitle>
                            <CardDescription>Automated birthday surprises</CardDescription>
                        </div>
                    </div>
                    <Switch
                        checked={config.birthdayMessageEnabled}
                        onCheckedChange={(c) =>
                            setConfig((prev) => ({ ...prev, birthdayMessageEnabled: c }))
                        }
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div
                    className={`space-y-4 transition-all duration-300 ${!config.birthdayMessageEnabled
                        ? "opacity-50 pointer-events-none grayscale-[0.5]"
                        : ""
                        }`}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Days Before
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                className="bg-muted/30"
                                value={config.daysBeforeBirthday}
                                onChange={(e) =>
                                    setConfig(prev => ({
                                        ...prev,
                                        daysBeforeBirthday: parseInt(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Days After
                            </Label>
                            <Input
                                type="number"
                                min="0"
                                className="bg-muted/30"
                                value={config.daysAfterBirthday}
                                onChange={(e) =>
                                    setConfig(prev => ({
                                        ...prev,
                                        daysAfterBirthday: parseInt(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Birthday Coupon Batch
                        </Label>
                        <BatchSelector
                            selectedId={config.birthdayCouponBatchId}
                            batches={couponBatches}
                            isOpen={birthdayBatchDropdownOpen}
                            setIsOpen={setBirthdayBatchDropdownOpen}
                            onSelect={(id) =>
                                setConfig(prev => ({ ...prev, birthdayCouponBatchId: id }))
                            }
                            loading={loadingBatches}
                            placeholder="Select birthday treat..."
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
