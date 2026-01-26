"use client";

import React, { useState } from "react";
import {
    Calendar,
    Clock,
    MessageCircle,
    Save,
    Info,
    Users,
    BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

export default function AutomationSettings() {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        birthday: {
            enabled: true,
            daysBefore: 3,
            message: "Happy Birthday! 🎂 Here is a special treat just for you: [COUPON_LINK]",
            costPerMsg: "0.05"
        },
        inactive: {
            enabled: false,
            daysInactive: 30,
            message: "We miss you! 👋 Come back and enjoy 10% off your next visit: [COUPON_LINK]",
            costPerMsg: "0.05"
        },
        festival: {
            enabled: false,
            eventName: "New Year Sale",
            scheduleDate: "2026-01-01",
            message: "Happy New Year! 🎉 Celebrations start with us. 20% off all items!",
            costPerMsg: "0.05"
        }
    });

    const handleSave = async () => {
        setLoading(true);
        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        toast.success("Automation settings saved successfully");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">WhatsApp Automation</h2>
                    <p className="text-muted-foreground">Engage customers automatically with scheduled messages.</p>
                </div>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Configuration</>}
                </Button>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages Sent</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">1,245</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-red-600">$62.25</div>
                        <p className="text-xs text-muted-foreground">Avg $0.05 per msg</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Coupons Redeemed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-green-600">856</div>
                        <p className="text-xs text-muted-foreground">Via WhatsApp links</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold text-blue-600">68.7%</div>
                        <p className="text-xs text-muted-foreground">Top tier performance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Birthday Automation */}
                <Card className="border-l-4 border-l-pink-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-pink-500" />
                                    Birthday Rewards
                                </CardTitle>
                                <CardDescription>Send automated wishes & coupons.</CardDescription>
                            </div>
                            <Switch
                                checked={config.birthday.enabled}
                                onCheckedChange={c => setConfig({ ...config, birthday: { ...config.birthday, enabled: c } })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Send</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={config.birthday.daysBefore}
                                        onChange={e => setConfig({ ...config, birthday: { ...config.birthday, daysBefore: e.target.value } })}
                                    />
                                    <span className="text-sm text-muted-foreground">days before birthday</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Est. Cost</Label>
                                <div className="text-sm font-medium pt-2">
                                    ${config.birthday.costPerMsg} / message
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Message Template</Label>
                            <Textarea
                                value={config.birthday.message}
                                onChange={e => setConfig({ ...config, birthday: { ...config.birthday, message: e.target.value } })}
                                rows={3}
                                disabled={!config.birthday.enabled}
                            />
                            <p className="text-xs text-muted-foreground">
                                Tip: Use [COUPON_LINK] to insert the unique reward link.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Inactive Customer Re-engagement */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Win-Back Inactive
                                </CardTitle>
                                <CardDescription>Re-engage customers who haven't visited lately.</CardDescription>
                            </div>
                            <Switch
                                checked={config.inactive.enabled}
                                onCheckedChange={c => setConfig({ ...config, inactive: { ...config.inactive, enabled: c } })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Trigger after</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={config.inactive.daysInactive}
                                        onChange={e => setConfig({ ...config, inactive: { ...config.inactive, daysInactive: e.target.value } })}
                                    />
                                    <span className="text-sm text-muted-foreground">days of no visit</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Est. Cost</Label>
                                <div className="text-sm font-medium pt-2">
                                    ${config.inactive.costPerMsg} / message
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Message Template</Label>
                            <Textarea
                                value={config.inactive.message}
                                onChange={e => setConfig({ ...config, inactive: { ...config.inactive, message: e.target.value } })}
                                rows={3}
                                disabled={!config.inactive.enabled}
                            />
                            <p className="text-xs text-muted-foreground">
                                Target high-value customers who slipped away.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Festival / Campaign Blast (Single Shot) */}
                <Card className="border-l-4 border-l-purple-500 lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BellRing className="h-5 w-5 text-purple-500" />
                                    Festival & Event Blast
                                </CardTitle>
                                <CardDescription>Schedule a one-time message to all active customers.</CardDescription>
                            </div>
                            <Switch
                                checked={config.festival.enabled}
                                onCheckedChange={c => setConfig({ ...config, festival: { ...config.festival, enabled: c } })}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Campaign Name</Label>
                                    <Input
                                        value={config.festival.eventName}
                                        onChange={e => setConfig({ ...config, festival: { ...config.festival, eventName: e.target.value } })}
                                        placeholder="e.g. Christmas Sale"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Scheduled Date</Label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={config.festival.scheduleDate}
                                            onChange={e => setConfig({ ...config, festival: { ...config.festival, scheduleDate: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label>Broadcast Message</Label>
                                <Textarea
                                    value={config.festival.message}
                                    onChange={e => setConfig({ ...config, festival: { ...config.festival, message: e.target.value } })}
                                    rows={5}
                                    className="resize-none"
                                    placeholder="Write your message here..."
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Audience: All opt-in customers</span>
                                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                                        Est. Cost: $0.05/msg
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
