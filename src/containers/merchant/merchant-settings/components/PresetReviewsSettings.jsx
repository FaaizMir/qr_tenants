import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquareQuote, Save, Loader2 } from "lucide-react";

export default function PresetReviewsSettings({
    config,
    setConfig,
    loadingPresets,
    onSavePresets,
}) {
    const handlePresetChange = (index, value) => {
        const newPresets = [...config.presets];
        newPresets[index] = value;
        setConfig({ ...config, presets: newPresets });
    };

    return (
        <Card className="border-muted/40 shadow-sm">
            <CardHeader className="pb-6 border-b border-muted/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                            <MessageSquareQuote className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold">
                                Quick Review Options
                            </CardTitle>
                            <CardDescription>
                                Pre-written reviews for customers to choose from
                            </CardDescription>
                        </div>
                    </div>
                    <Switch
                        checked={config.enablePresetReviews}
                        onCheckedChange={(c) =>
                            setConfig({ ...config, enablePresetReviews: c })
                        }
                    />
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${!config.enablePresetReviews ? "opacity-50 pointer-events-none" : ""
                        }`}
                >
                    {config.presets.map((preset, idx) => (
                        <div key={idx} className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                                {idx + 1}
                            </div>
                            <Input
                                value={preset}
                                onChange={(e) => handlePresetChange(idx, e.target.value)}
                                className="pl-12 bg-muted/20 border-muted/60 focus:bg-background transition-colors"
                                placeholder={`Example: "Great service!"`}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onSavePresets}
                        disabled={loadingPresets || !config.enablePresetReviews}
                        className="gap-2"
                    >
                        {loadingPresets ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Presets Only
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
