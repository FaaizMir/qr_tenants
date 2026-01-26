"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";

export function AgentStatusToggle({ initialStatus, agentId }) {
    const [isActive, setIsActive] = useState(initialStatus === "active" || initialStatus === true);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (checked) => {
        setIsLoading(true);
        // Store original state to revert if needed
        const originalState = isActive;

        // Optimistic UI update
        setIsActive(checked);

        try {
            await axiosInstance.patch(`/admins/${agentId}`, { is_active: checked });
            toast.success(`Agent ${checked ? "activated" : "deactivated"} successfully`);
        } catch (error) {
            console.error("Error toggling agent status:", error);
            setIsActive(originalState); // Revert on error
            toast.error(error?.response?.data?.message || "Failed to update agent status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
