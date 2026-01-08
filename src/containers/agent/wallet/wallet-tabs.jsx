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

export const getWalletTabs = ({
  walletStats,
  transactions,
  deductions,
  transactionTable,
  deductionTable,
  tAgentWallet,
}) => [
    {
      value: "balance",
      label: tAgentWallet("balance"),
      content: (
        <div className="space-y-6">
          {/* Account Details Section */}
          {walletStats.admin && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Account Details
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Update Profile</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Agent Name
                  </p>
                  <div className="flex items-center gap-2 font-medium text-lg">
                    {walletStats.admin.name}
                    {walletStats.admin.isActive && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Active Partner
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> Registered Email
                  </p>
                  <p className="font-medium">{walletStats.admin.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" /> Contact Phone
                  </p>
                  <p className="font-medium">{walletStats.admin.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Current Balance */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">
                  {tAgentWallet("currentbalance")}
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {walletStats.currency} {walletStats.balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prepaid credits available
                </p>
                <Button size="sm" className="w-full mt-3 h-8">Top Up Balance</Button>
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Lifetime Earnings
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {walletStats.currency}{" "}
                  {walletStats.total_earnings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Gross commissions
                </p>
              </CardContent>
            </Card>

            {/* Total Deducted */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Auto-Deductions</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {walletStats.currency}{" "}
                  {walletStats.total_spent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  System fees & costs
                </p>
              </CardContent>
            </Card>

            {/* Net Profit (Calculated) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {walletStats.currency}{" "}
                  {(walletStats.total_earnings - walletStats.total_spent).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Realized profit
                </p>
              </CardContent>
            </Card>

          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 text-sm text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-900">
            <RefreshCw className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Automatic Billing Active</p>
              <p className="opacity-90">
                System service fees, WhatsApp message costs (utility/marketing), and annual merchant backend costs are automatically deducted from your prepaid balance.
                Please maintain a positive balance to avoid service interruptions.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "transactions",
      label: tAgentWallet("transactions"),
      content: transactionTable,
    },
    {
      value: "auto-deductions",
      label: tAgentWallet("autodeduction"),
      content: deductionTable,
    },
  ];
