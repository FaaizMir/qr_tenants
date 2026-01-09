"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function MerchantStatusToggle({ initialStatus, merchantId }) {
    const [isActive, setIsActive] = useState(initialStatus === "active");

    const handleToggle = async (checked) => {
        // Optimistic UI update
        setIsActive(checked);

        // In a real app, you would make an API call here.
        // try {
        //   await updateMerchantStatus(merchantId, checked ? 'active' : 'inactive');
        //   toast.success(`Merchant ${checked ? "activated" : "deactivated"} successfully`);
        // } catch (error) {
        //   setIsActive(!checked); // Revert on error
        //   toast.error("Failed to update status");
        // }

        toast.success(`Merchant status changed to ${checked ? "Active" : "Inactive"}`);
    };

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
            />
            <span className="text-sm capitalize text-muted-foreground w-[60px]">
                {isActive ? "Active" : "Inactive"}
            </span>
        </div>
    );
}
