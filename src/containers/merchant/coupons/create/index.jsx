"use client";

import { useState } from "react";
import { ArrowLeft, Upload, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSubscriptionType, getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function MerchantCreateCouponContainer() {
    const router = useRouter();
    const subscriptionType = getSubscriptionType();
    const isAnnual = subscriptionType === "annual";
    const [loading, setLoading] = useState(false);

    // form state
    const [batchName, setBatchName] = useState("");
    const [batchType, setBatchType] = useState("temporary");
    const [totalQuantity, setTotalQuantity] = useState(isAnnual ? 1000 : 100);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [whatsappEnabled, setWhatsappEnabled] = useState(true);
    const [luckyDrawEnabled, setLuckyDrawEnabled] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const currentUser = getCurrentUser();
            const merchant_id = currentUser?.merchant_id || currentUser?.merchant?.id || currentUser?.id;
            if (!merchant_id) {
                toast.error("Unable to determine merchant id. Please contact support.");
                setLoading(false);
                return;
            }

            const payload = {
                merchant_id: Number(merchant_id),
                batch_name: batchName,
                batch_type: batchType,
                total_quantity: Number(totalQuantity),
                start_date: startDate ? `${startDate}T00:00:00Z` : null,
                end_date: endDate ? `${endDate}T23:59:59Z` : null,
                is_active: Boolean(isActive),
                whatsapp_enabled: Boolean(whatsappEnabled),
                lucky_draw_enabled: Boolean(luckyDrawEnabled),
            };

            const resp = await axiosInstance.post("/coupon-batches", payload);
            toast.success("Coupon batch created successfully");
            router.push("/en/merchant/coupons");
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || "Failed to create coupon batch.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/en/merchant/coupons">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Create Coupon Batch</h1>
                    <p className="text-muted-foreground">Generate new serial codes for your campaign</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Form */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Details</CardTitle>
                            <CardDescription>Configure your coupon parameters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Batch Name</Label>
                                    <Input id="name" placeholder="e.g. Summer Sale 2025" required value={batchName} onChange={(e)=>setBatchName(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity">Quantity</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            placeholder="100"
                                            max={isAnnual ? 10000 : 500}
                                            required
                                            value={totalQuantity}
                                            onChange={(e)=>setTotalQuantity(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Limit: {isAnnual ? "10,000" : "500"} codes
                                            {!isAnnual && " (Upgrade for more)"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Batch Type</Label>
                                        <Input id="type" placeholder="temporary" required value={batchType} onChange={(e)=>setBatchType(e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start">Start Date</Label>
                                        <Input id="start" type="date" required value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end">End Date</Label>
                                        <Input id="end" type="date" required value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                                    </div>
                                </div>

                                {/* <div className="space-y-2">
                                    <Label>Coupon Design</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer h-32">
                                            <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                                            <span className="text-sm font-medium">Upload Background</span>
                                            <span className="text-xs text-muted-foreground">JPG, PNG</span>
                                        </div>
                                        <div className="border-2 border-muted rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition cursor-pointer h-32">
                                            <LayoutTemplate className="h-6 w-6 mb-2 text-muted-foreground" />
                                            <span className="text-sm font-medium">Use Template</span>
                                        </div>
                                    </div>
                                </div> */}

                                <div className="grid grid-cols-3 gap-4 ">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} /> Active</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={whatsappEnabled} onChange={(e)=>setWhatsappEnabled(e.target.checked)} /> WhatsApp Enabled</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={luckyDrawEnabled} onChange={(e)=>setLuckyDrawEnabled(e.target.checked)} /> Lucky Draw</label>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Generating Codes..." : "Generate Batch"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Preview & Tips */}
                <div className="space-y-6">
                    {/* <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg text-primary">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-[3/2] rounded-lg bg-white border shadow-sm p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 transform translate-x-2 translate-y-2 rotate-45">
                                    SALE
                                </div>
                                <div className="h-full flex flex-col justify-between">
                                    <div className="text-center mt-2">
                                        <h3 className="font-bold text-lg">{batchName || "Summer Sale"}</h3>
                                        <p className="text-2xl font-black text-primary my-1">20% OFF</p>
                                        <p className="text-xs text-muted-foreground">Valid until {endDate || "Dec 31, 2025"}</p>
                                    </div>
                                    <div className="bg-gray-100 p-2 text-center rounded border border-dashed border-gray-300">
                                        <p className="font-mono text-sm tracking-widest">{Array.from({length:6}).map(()=>String.fromCharCode(65+Math.floor(Math.random()*26))).join("")}-{Math.floor(Math.random()*9000+1000)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>• Use descriptive batch names to track performance easily.</p>
                            <p>• Set expiration dates to create urgency.</p>
                            <p>• Annual plan members can issue up to 10,000 coupons per batch.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
