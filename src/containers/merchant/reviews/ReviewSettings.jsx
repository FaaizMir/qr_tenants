"use client";

import React, { useState } from "react";
import { Save, Plus, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ReviewSettings() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        rewardType: "lucky_draw", // options: "none", "coupon", "lucky_draw"
        enablePresetReviews: true,
        enableGoogle: true,
        enableFacebook: false,
        enableInstagram: false,
        enableRed: false,
        googleReviewLink: "https://g.page/...",
        facebookReviewLink: "",
        instagramReviewLink: "",
        redReviewLink: "",
        presets: [
            "Delicious food and great service! ⭐",
            "Loved the atmosphere! 🍷",
            "Staff was super friendly. 😊",
            "Hidden gem! Highly recommend. 💎",
            "Best experience in a while! 🚀",
            "Quality products and fast delivery. 📦",
            "Will come back again! 🔄",
            "Great value for money. 💰",
            "Professional service. 👔",
            "Simply amazing! 😍"
        ]
    });

    const handlePresetChange = (index, value) => {
        const newPresets = [...config.presets];
        newPresets[index] = value;
        setConfig({ ...config, presets: newPresets });
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success("Settings saved successfully");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Review & Reward Settings</h2>
                    <p className="text-muted-foreground">Configure how customers review your business and what rewards they get.</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Platform Links */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Platforms</CardTitle>
                        <CardDescription>Where do you want customers to post reviews?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Google Business Profile</Label>
                                <Switch
                                    checked={config.enableGoogle}
                                    onCheckedChange={(c) => setConfig({ ...config, enableGoogle: c })}
                                />
                            </div>
                            <Input
                                placeholder="https://g.page/r/..."
                                value={config.googleReviewLink}
                                onChange={e => setConfig({ ...config, googleReviewLink: e.target.value })}
                                disabled={!config.enableGoogle}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Facebook Page</Label>
                                <Switch
                                    checked={config.enableFacebook}
                                    onCheckedChange={(c) => setConfig({ ...config, enableFacebook: c })}
                                />
                            </div>
                            <Input
                                placeholder="https://facebook.com/..."
                                value={config.facebookReviewLink}
                                onChange={e => setConfig({ ...config, facebookReviewLink: e.target.value })}
                                disabled={!config.enableFacebook}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Instagram Profile/Post</Label>
                                <Switch
                                    checked={config.enableInstagram}
                                    onCheckedChange={(c) => setConfig({ ...config, enableInstagram: c })}
                                />
                            </div>
                            <Input
                                placeholder="https://instagram.com/..."
                                value={config.instagramReviewLink}
                                onChange={e => setConfig({ ...config, instagramReviewLink: e.target.value })}
                                disabled={!config.enableInstagram}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>XiaoHongShu (RED)</Label>
                                <Switch
                                    checked={config.enableRed}
                                    onCheckedChange={(c) => setConfig({ ...config, enableRed: c })}
                                />
                            </div>
                            <Input
                                placeholder="https://..."
                                value={config.redReviewLink}
                                onChange={e => setConfig({ ...config, redReviewLink: e.target.value })}
                                disabled={!config.enableRed}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Toggles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Features & Rewards</CardTitle>
                        <CardDescription>Enable lucky draws or direct coupons.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Reward Strategy</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div
                                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === 'none' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                    onClick={() => setConfig({ ...config, rewardType: 'none' })}
                                >
                                    <div className="font-bold mb-1">No Reward</div>
                                    <div className="text-xs text-muted-foreground">Review only. No incentive provided.</div>
                                </div>
                                <div
                                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === 'coupon' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                    onClick={() => setConfig({ ...config, rewardType: 'coupon' })}
                                >
                                    <div className="font-bold mb-1">Direct Coupon</div>
                                    <div className="text-xs text-muted-foreground">Send a fixed coupon via WhatsApp immediately.</div>
                                </div>
                                <div
                                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${config.rewardType === 'lucky_draw' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                    onClick={() => setConfig({ ...config, rewardType: 'lucky_draw' })}
                                >
                                    <div className="font-bold mb-1">Lucky Draw</div>
                                    <div className="text-xs text-muted-foreground">Gamified experience with variable prizes.</div>
                                </div>
                            </div>

                            {config.rewardType === 'lucky_draw' && (
                                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2 border border-orange-100">
                                    Manage prizes and probabilities in the <b>Lucky Draw</b> tab.
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                            <div className="space-y-0.5">
                                <Label className="text-base">Use Preset Sentences</Label>
                                <div className="text-sm text-muted-foreground">
                                    Allow customers to pick from pre-written reviews.
                                </div>
                            </div>
                            <Switch
                                checked={config.enablePresetReviews}
                                onCheckedChange={c => setConfig({ ...config, enablePresetReviews: c })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preset Sentences Editor */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Preset Review Sentences (10 Max)</CardTitle>
                        <CardDescription>Customize the quick-reply options your customers see.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.presets.map((preset, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="bg-muted w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium">
                                        {idx + 1}
                                    </div>
                                    <Input
                                        value={preset}
                                        onChange={(e) => handlePresetChange(idx, e.target.value)}
                                        disabled={!config.enablePresetReviews}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
