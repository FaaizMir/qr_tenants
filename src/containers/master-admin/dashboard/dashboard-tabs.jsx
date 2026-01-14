import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import MasterAdminOverviewTab from "./overview-tab";

export const getDashboardTabs = ({
    kpiData,
    recentActivities,
    tMasterAdminDashboard,
}) => [
        {
            value: "overview",
            label: "Overview",
            content: <MasterAdminOverviewTab />,
        },
    ];
