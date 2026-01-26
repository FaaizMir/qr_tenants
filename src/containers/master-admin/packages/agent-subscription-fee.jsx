"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Edit3,
    Calendar,
    Sparkles,
    RefreshCcw,
    CheckCircle2,
    TrendingUp,
    AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgentSubscriptionFee() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [newFee, setNewFee] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchFee = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/wallets/super-admin");
            setData(res.data);
            setNewFee(res.data.admin_subscription_fee);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch subscription fee");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFee();
    }, []);

    const handleUpdate = async () => {
        if (!newFee || isNaN(newFee)) {
            toast.error("Please enter a valid amount");
            return;
        }
        console.log("newfee", newFee);

        setUpdating(true);
        try {
            await axiosInstance.patch("/wallets/super-admin/subscription-fee", {
                fee: Number(newFee),
            });
            toast.success("Subscription fee updated successfully");
            setIsUpdateOpen(false);
            fetchFee();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update fee");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="p-8">
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Primary Fee Card */}
            <Card className="relative overflow-hidden border-none shadow-2xl rounded-3xl bg-slate-900 text-white group md:col-span-2">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-primary/20 text-primary-foreground border-none px-3 py-1 font-bold tracking-wider uppercase text-[10px]">
                            Platform Standard
                        </Badge>
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                        Agent Annual Membership
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 pt-4">
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-5xl font-extrabold tracking-tighter">
                            {data?.currency || "USD"}{" "}
                            {Number(data?.admin_subscription_fee).toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            / Fixed Per Year
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Billing Cycle
                                </span>
                            </div>
                            <p className="font-bold text-sm">365 Days Recurring</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1 text-slate-400">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    Status
                                </span>
                            </div>
                            <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Active Plan
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                        <Button
                            onClick={() => setIsUpdateOpen(true)}
                            className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-lg shadow-primary/20 group/btn"
                        >
                            <Edit3 className="h-4 w-4 mr-2 transition-transform group-hover/btn:-rotate-12" />
                            Update Pricing Structure
                        </Button>
                        <Button
                            variant="outline"
                            onClick={fetchFee}
                            className="h-12 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold px-6"
                        >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Sync Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Insight Card */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 text-white md:col-span-1 lg:col-span-1 hidden lg:flex flex-col justify-between">
                <CardHeader>
                    <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4">
                        <Sparkles className="h-6 w-6 text-yellow-300" />
                    </div>
                    <CardTitle className="text-xl font-bold leading-tight">
                        Revenue Intelligence
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                    <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
                        Adjusting the subscription fee affects platform accessibility for
                        new agents. Ensure the pricing remains competitive while
                        maintaining platform quality.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-bold text-white/80 uppercase">
                                Global Currency: {data?.currency || "USD"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-white opacity-40" />
                            <span className="text-xs font-bold text-white/80 uppercase">
                                Auto-Deduction Enabled
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Update Dialog */}
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-4xl border-none shadow-2xl p-8 bg-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                            Update Subscription Fee
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium pt-2">
                            Set the new annual membership fee for all agents on the platform.
                            Changes take effect immediately for new renewals.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                New Annual Fee ({data?.currency || "USD"})
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-primary transition-colors">
                                    $
                                </div>
                                <Input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(e.target.value)}
                                    className="h-14 pl-8 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-amber-800 leading-normal">
                                Careful: Drastic price changes can influence agent retention.
                                Changes will be logged in the system audit.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:justify-start">
                        <Button
                            type="submit"
                            onClick={handleUpdate}
                            disabled={updating}
                            className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all disabled:opacity-50"
                        >
                            {updating ? (
                                <RefreshCcw className="h-5 w-5 animate-spin" />
                            ) : (
                                "Confirm & Update"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsUpdateOpen(false)}
                            className="h-14 rounded-2xl px-6 font-bold bg-slate-100 hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
