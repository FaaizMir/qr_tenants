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
  tAgentWallet,
}) => [
    {
      value: "balance",
      label: tAgentWallet("balance"),
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Account Details */}
            {walletStats.admin && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5 text-primary" />
                    Agent Account Details
                  </CardTitle>
                  <CardDescription>Manage your registered personal and business information</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Agent Name
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-lg">{walletStats.admin.user.name}</span>
                      {walletStats.admin.isActive && (
                        <div className="w-fit">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            ACTIVE PARTNER
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email Address
                    </p>
                    <p className="font-medium text-sm break-all">{walletStats.admin.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Contact Phone
                    </p>
                    <p className="font-medium text-sm">{walletStats.admin.user.phone || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Balance Card */}
            <Card className="bg-linear-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-center">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {tAgentWallet("currentbalance")}
                  </CardTitle>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-primary">
                  {walletStats.currency} {walletStats.balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  Available prepaid credits
                </p>
              </CardContent>
            </Card>
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
      value: "earnings",
      label: "Earnings",
      content: <AgentEarningsContainer />,
    },
  ];
