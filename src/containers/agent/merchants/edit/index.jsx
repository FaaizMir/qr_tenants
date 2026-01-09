"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MerchantForm } from "../create/merchant-form";
import { getMerchantById } from "@/lib/services/helper";
import { LoadingSpinner } from "@/helper/Loader";
import { toast } from "sonner";

export default function EditMerchantContainer({ merchantId }) {
    const t = useTranslations("agent.merchants");
    const [merchantData, setMerchantData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchMerchant() {
            try {
                setLoading(true);
                const data = await getMerchantById(merchantId);
                console.debug("Fetched merchant data:", data);
                setMerchantData(data);
            } catch (err) {
                console.error("Error fetching merchant:", err);
                setError(err?.response?.data?.message || "Failed to load merchant data");
                toast.error("Failed to load merchant data");
            } finally {
                setLoading(false);
            }
        }

        if (merchantId) {
            fetchMerchant();
        }
    }, [merchantId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner className="h-8 w-8" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 lg:p-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Edit Merchant
                </h1>
                <p className="text-muted-foreground">
                    Update merchant account details and configuration.
                </p>
            </div>

            <MerchantForm
                initialData={merchantData}
                isEdit={true}
                merchantId={merchantId}
            />
        </div>
    );
}
