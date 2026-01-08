import { KpiCard } from "@/components/common/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Wallet,
  Download,
  Plus,
  Users,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const getDashboardTabs = ({
  kpiData,
  recentActivities,
  tAgentDashboard,
}) => [
    {
      value: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
              <KpiCard key={index} {...kpi} className="shadow-sm" />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            {/* Main Action / Revenue Area (Placeholder for Chart) */}
            <Card className="col-span-4 border-none shadow-md bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-bold">Revenue Growth</CardTitle>
                  <CardDescription>Monthly commission earnings overview</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  View Report <ArrowUpRight className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center rounded-lg border border-dashed bg-background/50">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm">Revenue Chart Visualization</p>
                    <p className="text-xs text-muted-foreground/60">(Simulated Data)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side Panel: Recent Activity & Quick Wallet */}
            <div className="col-span-3 space-y-6">
              {/* Wallet Mini-Widget */}
              <Card className="bg-primary/5 border-primary/20 shadow-none">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <Wallet className="h-4 w-4 text-primary" /> Wallet
                  </CardTitle>
                  <Link href="/agent/wallet" className="text-xs font-normal text-muted-foreground hover:text-primary hover:underline">
                    History
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-2xl font-bold">$1,200.50</span>
                    <span className="text-xs text-muted-foreground">Available Credits</span>
                  </div>
                  <Button size="sm" className="w-full">Top Up Balance</Button>
                </CardContent>
              </Card>

              {/* Recent Activity List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex justify-between items-center">
                    Activity
                    <Link href="/agent/activity" className="text-xs font-normal text-muted-foreground hover:text-primary hover:underline">View all</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px] p-4 pt-0">
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 text-sm">
                          <div className={`mt-0.5 relative flex-none w-2 h-2 rounded-full ${activity.type === 'credit' ? 'bg-emerald-500' :
                            activity.type === 'debit' ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-foreground leading-none">{activity.merchant}</p>
                            <p className="text-muted-foreground text-xs">{activity.action}</p>
                          </div>
                          <div className="text-right flex-none">
                            <div className={`font-medium ${activity.type === 'credit' ? 'text-emerald-600' : 'text-foreground'
                              }`}>
                              {activity.amount}
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/agent/merchants/create" className="group">
              <Card className="h-full border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary">
                  <div className="p-2 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm">New Merchant</span>
                </div>
              </Card>
            </Link>

            <Link href="/agent/merchants" className="group">
              <Card className="h-full hover:bg-muted/50 transition-colors p-6 flex flex-col justify-between">
                <Users className="h-5 w-5 text-muted-foreground mb-2" />
                <div>
                  <p className="font-medium text-sm">Manage Merchants</p>
                  <p className="text-xs text-muted-foreground">Accounts, plans, limits</p>
                </div>
              </Card>
            </Link>

            <Link href="/agent/earnings" className="group">
              <Card className="h-full hover:bg-muted/50 transition-colors p-6 flex flex-col justify-between">
                <FileText className="h-5 w-5 text-muted-foreground mb-2" />
                <div>
                  <p className="font-medium text-sm">Monthly Statements</p>
                  <p className="text-xs text-muted-foreground">Download PDF reports</p>
                </div>
              </Card>
            </Link>

            <Link href="/agent/settings" className="group">
              <Card className="h-full bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-300 transition-colors p-6 flex flex-col justify-between">
                <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-600 flex items-center justify-center text-[10px] font-bold mb-2">WL</div>
                <div>
                  <p className="font-medium text-sm text-indigo-900 dark:text-indigo-200">White Label</p>
                  <p className="text-xs text-indigo-700/60 dark:text-indigo-400/60">Brand settings & Domain</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      ),
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
