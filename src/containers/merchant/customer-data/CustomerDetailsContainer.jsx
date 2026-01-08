"use client";

import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Users,
    Gift,
    History,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import axios from "@/lib/axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";

export default function CustomerDetailsContainer() {
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();
    const id = Number(params?.id);
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/customers/${id}`);
                setCustomer(res.data.data);
            } catch (err) {
                console.error("Failed to fetch customer details", err);
                setError("Failed to load customer details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCustomer();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <p className="text-destructive font-medium">
                    {error || "Customer not found"}
                </p>
                <Link href="/merchant/customer-data">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Customers
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/merchant/customer-data">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Customer Profile
                        </h1>
                        <p className="text-muted-foreground">
                            Detailed overview of customer information
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge
                        variant={customer.reward ? "default" : "secondary"}
                        className="h-fit px-3 py-1 text-sm"
                    >
                        {customer.reward ? "Eligible for Reward" : "Standard Customer"}
                    </Badge>
                </div>
            </div>


            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Essential Info */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="h-12 w-12" />
                        </div>
                        <CardTitle className="text-2xl">{customer.name}</CardTitle>
                        <CardDescription>{customer.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone Number</p>
                                <p className="text-sm font-medium">{customer.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                <p className="text-sm font-medium">
                                    {customer.date_of_birth || "Not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Gender</p>
                                <p className="text-sm font-medium capitalize">
                                    {customer.gender || "Not specified"}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                <Gift className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Reward Status</p>
                                <p className="text-sm font-medium">
                                    {customer.reward ? "Active" : "Inactive"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column - Address and Activity */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                Contact Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl bg-muted/30 p-4 border border-border/50">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {customer.address || "No address provided"}
                                </p>
                            </div>

                            <div className="mt-8">
                                <h3 className="flex items-center gap-2 font-semibold mb-4">
                                    <History className="h-5 w-5 text-primary" />
                                    System Information
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                            Customer ID
                                        </p>
                                        <p className="font-mono text-sm font-semibold">
                                            #C-{customer.id}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                            Merchant ID
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {customer.merchant_id}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                            Created At
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {new Date(customer.created_at).toLocaleDateString()}{" "}
                                            <span className="text-muted-foreground font-normal">
                                                {new Date(customer.created_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                            Last Updated
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {new Date(customer.updated_at).toLocaleDateString()}{" "}
                                            <span className="text-muted-foreground font-normal">
                                                {new Date(customer.updated_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
