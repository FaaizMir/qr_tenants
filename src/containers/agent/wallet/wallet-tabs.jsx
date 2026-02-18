import {
  Wallet,
  TrendingUp,
  User,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/common/table-toolbar";
import { DataTable } from "@/components/common/data-table";
import AgentEarningsContainer from "../earnings";

export const getWalletTabs = ({
  walletStats,
  transactions,
  deductions,
  transactionTable,
  deductionTable,
}) => [
    {
      value: "balance",
      label: "Balance",
      content: (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Current Balance Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Balance
                </CardTitle>
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {walletStats.currency} {Number(walletStats.balance || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available prepaid credits
                </p>
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </CardTitle>
                <div className="rounded-lg bg-green-100 p-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {walletStats.currency} {Number(walletStats.total_earnings || 0).toLocaleString()}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" /> Lifetime profits
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription & Status Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Subscription & Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                  <div>
                    {walletStats.is_active ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                        ACTIVE ACCOUNT
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Plan Type</p>
                  <p className="font-semibold text-foreground uppercase text-sm">
                    {walletStats.subscription_type || "N/A"} Package
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Renewal Date</p>
                  <p className="font-semibold text-foreground text-sm">
                    {walletStats.subscription_expires_at
                      ? new Date(walletStats.subscription_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "No Date"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="border-0 shadow-md bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-green-800 uppercase tracking-tight">Financial Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-700 leading-relaxed">
                  Your wallet is protected with industry-standard encryption.
                  All transactions are audited in real-time to ensure the safety of your funds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      value: "transactions",
      label: "Transactions",
      content: transactionTable,
    },
    {
      value: "earnings",
      label: "Earnings",
      content: <AgentEarningsContainer />,
    },
  ];
