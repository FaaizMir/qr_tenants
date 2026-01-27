"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";

export function StaffStatusToggle({ staff }) {
    const [isActive, setIsActive] = useState(staff.is_active);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (checked) => {
        setLoading(true);
        try {
            await axiosInstance.patch(`/admins/${staff.id}`, {
                is_active: checked,
            });
            setIsActive(checked);
            toast.success(
                `Staff account ${checked ? "enabled" : "disabled"} successfully.`,
            );
        } catch (error) {
            console.error("Failed to update staff status:", error);
            toast.error(
                error?.response?.data?.message || "Failed to update staff status.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={loading}
            />
            <span className="text-sm capitalize text-muted-foreground w-[60px]">
                {isActive ? "Active" : "Inactive"}
            </span>
        </div>
    );
}
