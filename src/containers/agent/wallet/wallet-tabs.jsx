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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Current Balance Card */}
            <Card className="bg-linear-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-primary/5 blur-3xl opacity-50" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">
                  {tAgentWallet("currentbalance")}
                </CardTitle>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                  <Wallet className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-primary">
                  {walletStats.currency} {Number(walletStats.balance || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium italic opacity-70">
                  Available prepaid credits
                </p>
              </CardContent>
            </Card>

            {/* Total Earnings */}
            <Card className="shadow-sm border-muted/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">
                  Total Earnings
                </CardTitle>
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-emerald-100 transition-transform duration-300 group-hover:scale-110">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {walletStats.currency} {Number(walletStats.total_earnings || 0).toLocaleString()}
                </div>
                <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 w-fit rounded-full bg-emerald-50 border border-emerald-100/50 text-[10px] font-semibold text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" /> Lifetime profits
                </div>
              </CardContent>
            </Card>

            {/* Total Spent */}
            <Card className="shadow-sm border-muted/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">
                  Total Spent
                </CardTitle>
                <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600 ring-1 ring-orange-100 transition-transform duration-300 group-hover:scale-110">
                  <ArrowDownLeft className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {walletStats.currency} {Number(walletStats.total_spent || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-[10px] font-semibold text-orange-600 bg-orange-50/50 px-2 py-0.5 rounded-full border border-orange-100/50 w-fit">
                  Funds utilized
                </div>
              </CardContent>
            </Card>

            {/* Pending Amount */}
            <Card className="shadow-sm border-muted/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground/80">
                  Pending Amount
                </CardTitle>
                <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600 ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-110">
                  <RefreshCw className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {walletStats.currency} {Number(walletStats.pending_amount || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-[10px] font-medium text-slate-500 italic bg-slate-100/50 px-2 py-0.5 rounded-full border border-slate-200/50 w-fit">
                  Awaiting settlement
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Subscription & Status */}
            <Card className="lg:col-span-2 border-muted/60 bg-slate-50/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Subscription & Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</p>
                  <div>
                    {walletStats.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-sm">
                        ACTIVE ACCOUNT
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 shadow-sm">
                        INACTIVE
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Plan Type</p>
                  <p className="font-bold text-slate-900 uppercase text-sm tracking-tight">
                    {walletStats.subscription_type || "N/A"} Package
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Renewal Date</p>
                  <p className="font-bold text-slate-900 text-sm tracking-tight">
                    {walletStats.subscription_expires_at
                      ? new Date(walletStats.subscription_expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "No Date"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Note / Action Card */}
            <Card className="border-emerald-100 bg-emerald-50/10">
              <CardHeader className="pb-3 text-center lg:text-left">
                <CardTitle className="text-sm font-bold text-emerald-800 uppercase tracking-tight">Financial Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-emerald-700/80 font-medium leading-relaxed">
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
      label: tAgentWallet("transactions"),
      content: transactionTable,
    },
    {
      value: "earnings",
      label: "Earnings",
      content: <AgentEarningsContainer />,
    },
  ];
