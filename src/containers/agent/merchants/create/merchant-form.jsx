"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Store, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function MerchantForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        businessName: "",
        merchantType: "annual", // annual | temporary
        planId: "",
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Merchant account created successfully.");
            router.push("/agent/merchants");
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Account Info */}
            <Card className="border-l-4 border-l-primary shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 rounded-full text-primary"><User className="h-4 w-4" /></div>
                        <CardTitle>Account Credentials</CardTitle>
                    </div>
                    <CardDescription>
                        Login details for the merchant administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required value={formData.firstName} onChange={e => handleChange("firstName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required value={formData.lastName} onChange={e => handleChange("lastName", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="merchant@business.com" required value={formData.email} onChange={e => handleChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Initial Password</Label>
                        <Input id="password" type="password" required value={formData.password} onChange={e => handleChange("password", e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Business Info */}
            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-600"><Store className="h-4 w-4" /></div>
                        <CardTitle>Business Profile</CardTitle>
                    </div>
                    <CardDescription>Primary business details displayed to customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 md:w-1/2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" placeholder="e.g. Acme Café" required value={formData.businessName} onChange={e => handleChange("businessName", e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Plan */}
            <Card className="shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600"><CreditCard className="h-4 w-4" /></div>
                        <CardTitle>Subscription & Billing</CardTitle>
                    </div>
                    <CardDescription>Select the billing model and feature set.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Merchant Type</Label>
                            <Select value={formData.merchantType} onValueChange={v => handleChange("merchantType", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="annual">Annual Subscription</SelectItem>
                                    <SelectItem value="temporary">Temporary / Pop-up</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Annual merchants are billed yearly. Temporary merchants pay per active day/week.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Plan Tier</Label>
                            <Select value={formData.planId} onValueChange={v => handleChange("planId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a plan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basic">Basic Starter (Lim: 500 Credits)</SelectItem>
                                    <SelectItem value="pro">Pro Business (Lim: 2000 Credits)</SelectItem>
                                    <SelectItem value="enterprise">Unlimited Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-4 border">
                        <Checkbox id="marketing" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="marketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Enable Marketing Module
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Allows merchant to send WhatsApp campaigns (billed separately).
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t px-6 py-4 flex justify-between items-center">
                    <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading} className="min-w-[140px]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Creating..." : "Create Account"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
