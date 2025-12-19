import { KpiCard } from "@/components/common/kpi-card";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const getDashboardTabs = ({
  kpiData,
  recentActivities,
  tAgentDashboard,
}) => [
  {
    value: "overview",
    label: tAgentDashboard("overview"),
    content: (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {kpiData.map((kpi, index) => (
            <KpiCard key={index} {...kpi} />
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{tAgentDashboard("quickactions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/en/agent/merchants">
              <Button>{tAgentDashboard("addnewmerchant")}</Button>
            </Link>
            <Link href="/en/agent/earnings">
              <Button variant="outline">
                {tAgentDashboard("viewearningreports")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    value: "activity",
    label: tAgentDashboard("activity"),
    content: (
      <div className="space-y-6">
        <ChartWrapper title={tAgentDashboard("monthlyactivity")}>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart will display monthly merchant activity trends
          </div>
        </ChartWrapper>
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Link href="/agent/merchants/create">
                            <Button>Add New Merchant</Button>
                        </Link>
                        <Link href="/en/agent/earnings">
                            <Button variant="outline">View Earnings Report</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        ),
    },
    {
        value: "activity",
        label: "Activity",
        content: (
            <div className="space-y-6">
                <ChartWrapper title="Monthly Activity">
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Chart will display monthly merchant activity trends
                    </div>
                </ChartWrapper>

        <Card>
          <CardHeader>
            <CardTitle>{tAgentDashboard("recentactivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.merchant}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    value: "reports",
    label: tAgentDashboard("reports"),
    content: (
      <Card>
        <CardHeader>
          <CardTitle>{tAgentDashboard("recentreports")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">Monthly Earnings Report</p>
                <p className="text-sm text-muted-foreground">
                  Generated on June 1, 2024
                </p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-medium">Merchant Activity Report</p>
                <p className="text-sm text-muted-foreground">
                  Generated on May 28, 2024
                </p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Commission Summary</p>
                <p className="text-sm text-muted-foreground">
                  Generated on May 25, 2024
                </p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ),
  },
];
