"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import PaidAdsSettings from "@/containers/merchant/merchant-settings/components/PaidAdsSettings";
import { Loader2 } from "lucide-react";

export default function PaidAdsTabContainer() {
    const [config, setConfig] = useState({
        paid_ads: false,
        paid_ad_image: "",
        paid_ad_images: [],
        paid_ad_video_status: false,
        paid_ad_video: "",
        paid_ad_videos: [],
        placement: "top",
    });
    const [loading, setLoading] = useState(true);

    const { data: session } = useSession();
    const merchantId = session?.user?.merchantId;

    const fetchMerchantSettings = useCallback(async () => {
        if (!merchantId) return;

        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `/merchant-settings/merchant/${merchantId}`,
            );

            const data = res?.data?.data;
            if (!data) return;

            setConfig((prev) => ({
                ...prev,
                paid_ads: data.paid_ads ?? false,
                paid_ad_image: data.paid_ad_image || "",
                paid_ad_images: data.paid_ad_image ? [data.paid_ad_image] : [],
                paid_ad_video_status: data.paid_ad_type === "video",
                paid_ad_video: data.paid_ad_video || "",
                paid_ad_videos: data.paid_ad_video ? [data.paid_ad_video] : [],
                placement: data.paid_ad_placement || "top",
            }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load paid ads settings");
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    useEffect(() => {
        if (merchantId) {
            fetchMerchantSettings();
        }
    }, [merchantId, fetchMerchantSettings]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Paid Ads
                </h2>
                <p className="text-muted-foreground text-base max-w-2xl">
                    Manage your promotional content and ad placements to reach more
                    customers.
                </p>
            </div>
            <PaidAdsSettings
                config={config}
                setConfig={setConfig}
                merchantId={merchantId}
            />
        </div>
    );
}
