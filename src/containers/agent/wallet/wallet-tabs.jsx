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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <div className="flex items-center gap-2 font-medium">
                  {walletStats.admin.name}
                  {walletStats.admin.isActive && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Email
                </p>
                <p className="font-medium">{walletStats.admin.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="font-medium">{walletStats.admin.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tAgentWallet("currentbalance")}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletStats.currency} {walletStats.balance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          {/* Pending Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {tAgentWallet("pendingbalance")}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletStats.currency}{" "}
                {walletStats.pending_amount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Processing transactions
              </p>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {walletStats.currency}{" "}
                {walletStats.total_earnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          {/* Total Spent */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {walletStats.currency}{" "}
                {walletStats.total_spent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime expenditure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* <Card>
            <CardHeader>
              <CardTitle>{tAgentWallet("withdrawal")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button>{tAgentWallet("requestwithdrawal")}</Button>
            </CardContent>
          </Card> */}
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
