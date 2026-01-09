import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import AdminOverviewTab from "./overview-tab";

export const getDashboardTabs = ({
  kpiData,
  recentActivities,
  tAgentDashboard,
}) => [
    {
      value: "overview",
      label: "Overview",
      content: <AdminOverviewTab />,
    },

    {
      value: "reports",
      label: "Statements",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Financial Statements</CardTitle>
            <CardDescription>
              Monthly breakdown of commissions, merchant costs, and usage fees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: "May 2024", net: "$1,250.00", status: "Paid" },
                { month: "April 2024", net: "$3,100.50", status: "Paid" },
                { month: "March 2024", net: "$2,850.00", status: "Paid" },
              ].map((st, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Statement - {st.month}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Net Profit: {st.net}</span>
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-green-50 text-green-700 border-green-200">{st.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];
