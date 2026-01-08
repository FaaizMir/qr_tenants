"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UploadCloud, Palette, MessageCircle, FileText, Globe, Smartphone, Mail, CreditCard, LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function BrandingForm() {
    const t = useTranslations("agent.settings");
    const [loading, setLoading] = useState(false);

    // Default / Mock State
    const [data, setData] = useState({
        platformName: "My WhiteLabel Agency",
        primaryColor: "#6366f1", // Indigo
        logoConfig: null,
        waSenderId: "MyAgencySupport",
        supportEmail: "support@agency.com",
        supportPhone: "+1 (555) 0123-4567",
        defaultLanguage: "en",
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setLoading(false);
            toast.success("Branding configuration updated successfully.");
        }, 1200);
    };

    return (
        <div className="grid gap-6">

            {/* --- Section 1: Visual Identity --- */}
            <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            Visual Identity
                        </CardTitle>
                    </div>
                    <CardDescription>
                        These assets will be applied to your <strong>Dashboard</strong>, <strong>Merchant Panels</strong>, and <strong>Customer Landing Pages</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="gap-8 grid md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="platformName">Platform Name</Label>
                            <Input
                                id="platformName"
                                value={data.platformName}
                                onChange={(e) => setData({ ...data, platformName: e.target.value })}
                                className="bg-background/50 font-medium"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Displayed in browser titles, email footers, and system messages.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Primary Brand Color</Label>
                            <div className="flex gap-3 items-center">
                                <div
                                    className="w-12 h-12 rounded-xl border shadow-sm transition-all hover:scale-105"
                                    style={{ backgroundColor: data.primaryColor }}
                                />
                                <div className="flex-1 space-y-1">
                                    <Input
                                        id="color"
                                        value={data.primaryColor}
                                        onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                                        className="font-mono bg-background/50"
                                    />
                                    <p className="text-[10px] text-muted-foreground">HEX Color Code</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Select value={data.defaultLanguage} onValueChange={(v) => setData({ ...data, defaultLanguage: v })}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English (United States)</SelectItem>
                                    <SelectItem value="es">Spanish (Español)</SelectItem>
                                    <SelectItem value="fr">French (Français)</SelectItem>
                                    <SelectItem value="de">German (Deutsch)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Default language for new merchants and public pages.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Platform Logo</Label>
                        <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer bg-muted/10 group">
                            <div className="p-4 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <UploadCloud className="h-8 w-8 text-primary/80" />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-semibold text-foreground">Click to upload</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    SVG, PNG, JPG (Max 2MB)<br />
                                    Recommended: 400x120px
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-xs flex gap-2">
                            <LayoutTemplate className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                Logo appears on: Admin Navbar, Login Screen, PDF Reports, and Email Headers.
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Section 2: Communication & Support --- */}
            <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Communication & Support
                    </CardTitle>
                    <CardDescription>
                        Contact details used in <strong>WhatsApp Messages</strong>, <strong>PDF Invoices</strong>, and footers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="supportEmail" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Support Email</Label>
                            <Input
                                id="supportEmail"
                                value={data.supportEmail}
                                onChange={(e) => setData({ ...data, supportEmail: e.target.value })}
                                placeholder="help@yourbrand.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supportPhone" className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Support Phone</Label>
                            <Input
                                id="supportPhone"
                                value={data.supportPhone}
                                onChange={(e) => setData({ ...data, supportPhone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                            <Label htmlFor="waSender" className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp Sender Name</Label>
                            <Input
                                id="waSender"
                                value={data.waSenderId}
                                onChange={(e) => setData({ ...data, waSenderId: e.target.value })}
                                placeholder="e.g. Acme Verification"
                            />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Requires verified WhatsApp Business API integration.
                            </p>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Preview: Usage Locations
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                                <li><strong>Monthly Statements:</strong> Footer contact info.</li>
                                <li><strong>WhatsApp:</strong> "Sent securely by [Sender Name]".</li>
                                <li><strong>Help Center:</strong> Direct link to support email.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t flex justify-between items-center py-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        Changes propagate to all merchant sub-sites within 5 minutes.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => toast.info("Reset to defaults")}>Discard</Button>
                        <Button onClick={handleSave} disabled={loading} className="min-w-[140px]">
                            {loading ? "Applying..." : "Save Configuration"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
