import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function StatusBadge({ status, variant = "default" }) {
    const t = useTranslations("merchantDashboard.status");
    
    const statusConfig = {
        // Subscription types
        annual: { label: t("annual"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
        temporary: { label: t("temporary"), className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },

        // Activity status
        active: { label: t("active"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
        inactive: { label: t("inactive"), className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },

        // Payment status
        paid: { label: t("paid"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
        pending: { label: t("pending"), className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
        failed: { label: t("failed"), className: "bg-red-100 text-red-800 hover:bg-red-100" },

        // Coupon status
        exhausted: { label: t("exhausted"), className: "bg-red-100 text-red-800 hover:bg-red-100" },
        expired: { label: t("expired"), className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },

        // Sync status
        'in-progress': { label: t("inProgress"), className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
        completed: { label: t("completed"), className: "bg-green-100 text-green-800 hover:bg-green-100" },

        // Ticket status
        open: { label: t("open"), className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
        resolved: { label: t("resolved"), className: "bg-green-100 text-green-800 hover:bg-green-100" },

        // Serial code status
        used: { label: t("used"), className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
        unused: { label: t("unused"), className: "bg-green-100 text-green-800 hover:bg-green-100" },
    };

    const config = statusConfig[status] || {
        label: status,
        className: "bg-gray-100 text-gray-800 hover:bg-gray-100"
    };

    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    );
}
