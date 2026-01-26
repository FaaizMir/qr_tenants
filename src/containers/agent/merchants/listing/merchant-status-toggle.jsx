"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import { updateMerchant } from "@/lib/services/helper";

export function MerchantStatusToggle({ initialStatus, merchantId }) {
    const [isActive, setIsActive] = useState(initialStatus === "active" || initialStatus === true);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (checked) => {
        setIsLoading(true);
        // Store original state to revert if needed
        const originalState = isActive;

        // Optimistic UI update
        setIsActive(checked);

        try {
            await updateMerchant(merchantId, { is_active: checked });
            toast.success(`Merchant ${checked ? "activated" : "deactivated"} successfully`);
        } catch (error) {
            console.error("Error toggling merchant status:", error);
            setIsActive(originalState); // Revert on error
            toast.error(error?.response?.data?.message || "Failed to update merchant status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
            <span className="text-sm capitalize text-muted-foreground w-[60px]">
                {isActive ? "Active" : "Inactive"}
            </span>
        </div>
    );
}
