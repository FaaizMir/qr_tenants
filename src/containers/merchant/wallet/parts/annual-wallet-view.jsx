"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Clock3,
  Check,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Coins,
  Receipt,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import WalletWarnings from "./wallet-warnings";
import { Badge } from "@/components/ui/badge";
import useDebounce from "@/hooks/useDebounceRef";

const format = (num) => (typeof num === "number" ? num.toLocaleString() : "--");

export default function AnnualWalletView({
  wallet,
  summary,
  onValidate,
  validating,
  embedded = false,
}) {
  const balance = wallet?.balance ?? 0;
  const tiers = wallet?.tiers || ["MARKETING", "UTILITY"];
  const transactions = useMemo(
    () => wallet?.transactions ?? [],
    [wallet?.transactions],
  );
  const batchUsage = useMemo(() => summary?.batches ?? [], [summary?.batches]);
  const creditDetails = wallet?.creditBreakdown || {};
  const status = wallet?.status || {};

  const isLow = balance < 200;

  // Batch-wise usage table state
  const [batchSearch, setBatchSearch] = useState("");
  const debouncedBatchSearch = useDebounce(batchSearch, 500);
  const [batchPage, setBatchPage] = useState(0);
  const [batchPageSize, setBatchPageSize] = useState(10);

  // Transactions table state
  const [txSearch, setTxSearch] = useState("");
  const debouncedTxSearch = useDebounce(txSearch, 500);
  const [txPage, setTxPage] = useState(0);
  const [txPageSize, setTxPageSize] = useState(10);

  const filteredBatchUsage = useMemo(() => {
    if (!debouncedBatchSearch) return batchUsage || [];
    const term = debouncedBatchSearch.toLowerCase();
    return (batchUsage || []).filter((b) => {
      return (
        b?.name?.toLowerCase?.().includes(term) ||
        b?.tier?.toLowerCase?.().includes(term)
      );
    });
  }, [batchUsage, debouncedBatchSearch]);

  const pagedBatchUsage = useMemo(() => {
    const start = batchPage * batchPageSize;
    return filteredBatchUsage.slice(start, start + batchPageSize);
  }, [filteredBatchUsage, batchPage, batchPageSize]);

  const batchColumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Batch",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name || "—"}</span>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => (
          <span className="text-xs uppercase text-muted-foreground">
            {row.original.tier || "—"}
          </span>
        ),
      },
      {
        accessorKey: "used",
        header: "Used / Total",
        cell: ({ row }) => {
          const used = row.original.used ?? 0;
          const total = row.original.total ?? 0;
          return (
            <span className="text-sm">
              {format(used)} / {format(total)}
            </span>
          );
        },
      },
      {
        accessorKey: "lastUsed",
        header: "Last activity",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{row.original.lastUsed || "N/A"}</span>
          </div>
        ),
      },
    ],
    [],
  );

  const filteredTransactions = useMemo(() => {
    if (!debouncedTxSearch) return transactions || [];
    const term = debouncedTxSearch.toLowerCase();
    return (transactions || []).filter((t) => {
      return (
        t?.description?.toLowerCase?.().includes(term) ||
        t?.status?.toLowerCase?.().includes(term) ||
        t?.type?.toLowerCase?.().includes(term)
      );
    });
  }, [transactions, debouncedTxSearch]);

  const pagedTransactions = useMemo(() => {
    const start = txPage * txPageSize;
    return filteredTransactions.slice(start, start + txPageSize);
  }, [filteredTransactions, txPage, txPageSize]);

  const transactionColumns = useMemo(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.date
              ? new Date(row.original.date).toLocaleString()
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.description || "—"}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const type = row.original.type || "debit";
          const amount = Number(row.original.amount) || 0;
          const sign = type === "credit" ? "+" : "-";
          const color = type === "credit" ? "text-emerald-600" : "text-red-600";
          const currency = row.original.currency || wallet?.currency || "USD";
          return (
            <span className={`text-sm font-medium ${color}`}>
              {sign}
              {currency} {amount.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
            {row.original.status || "unknown"}
          </span>
        ),
      },
    ],
    [wallet?.currency],
  );

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h1 className="text-3xl font-bold">Wallet & Credits</h1>
          <p className="text-muted-foreground">
            Annual merchants see Marketing + Utility tiers and full history.
          </p>
        </header>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Main Balance */}
        <Card className="bg-linear-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-primary/5 blur-3xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Available Balance
              </CardTitle>
              <CardDescription>Ready to use credits</CardDescription>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Total Remaining Coupons
              </span>
              <div className="text-4xl font-bold tracking-tight text-primary">
                {format(balance)}
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                <span className="text-muted-foreground text-xs font-medium">
                  Coupon Credits
                </span>
                <span className="font-bold text-sm">
                  {format(creditDetails.marketing)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                <span className="text-muted-foreground text-xs font-medium">
                  Whatsapp Credits
                </span>
                <span className="font-bold text-sm">
                  {format(creditDetails.message)}
                </span>
              </div>
              <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                <span className="text-muted-foreground text-xs font-medium">
                  Paid Ad Credits
                </span>
                <span className="font-bold text-sm">
                  {format(creditDetails.utility)}
                </span>
              </div>
            </div>

            {/* <Button
              className="mt-2 w-full"
              variant="outline"
              size="sm"
              disabled={validating}
              onClick={onValidate}
            >
              {validating ? "Validating..." : "Validate Balance"}
            </Button> */}
          </CardContent>
        </Card>

        {/* Card 2: Credit Details */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Credit Breakdown
              </CardTitle>
              <CardDescription>Detailed allocation</CardDescription>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Purchased
                </span>
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {format(creditDetails.purchased)}
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-rose-50/50 border border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10">
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Used
                </span>
                <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
                  {format(creditDetails.used)}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
                <span>Usage Efficiency</span>
                <span className="font-medium text-foreground">
                  {creditDetails.purchased > 0
                    ? Math.round(
                        (creditDetails.used / creditDetails.purchased) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Subscription & Status */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Subscription
              </CardTitle>
              <CardDescription>{status.currency} Plan Status</CardDescription>
            </div>
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <span className="text-sm font-medium">Plan Type</span>
              <div className="font-bold capitalize text-primary">
                {wallet?.subscription_type || "Annual"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Batch-wise usage</h2>
            <p className="text-sm text-muted-foreground">
              Deduction details per batch.
            </p>
          </div>
        </div>

        <TableToolbar
          placeholder="Search batches..."
          total={batchUsage.length}
          onSearchChange={(val) => {
            setBatchSearch(val);
            setBatchPage(0);
          }}
          className="mt-2"
        />

        <Card>
          <CardContent className="pt-4">
            <DataTable
              data={pagedBatchUsage}
              columns={batchColumns}
              page={batchPage}
              pageSize={batchPageSize}
              total={filteredBatchUsage.length}
              setPage={setBatchPage}
              setPageSize={setBatchPageSize}
              pagination={true}
              columnsBtn={false}
            />
          </CardContent>
        </Card>
      </section> */}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent transactions</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-4 w-4 text-emerald-500" />
            Annual merchants see history by tier.
          </div>
        </div>
        <TableToolbar
          placeholder="Search transactions..."
          total={transactions.length}
          onSearchChange={(val) => {
            setTxSearch(val);
            setTxPage(0);
          }}
          className="mt-2"
        />

        <Card>
          <CardContent className="pt-4">
            <DataTable
              data={pagedTransactions}
              columns={transactionColumns}
              page={txPage}
              pageSize={txPageSize}
              total={filteredTransactions.length}
              setPage={setTxPage}
              setPageSize={setTxPageSize}
              pagination={true}
              columnsBtn={false}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
