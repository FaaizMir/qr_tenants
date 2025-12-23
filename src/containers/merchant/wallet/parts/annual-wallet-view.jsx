"use client";

import { useMemo, useState } from "react";
import { CreditCard, Clock3, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import WalletSummary from "./wallet-summary";
import WalletWarnings from "./wallet-warnings";

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
  const transactions = wallet?.transactions || [];
  const batchUsage = summary?.batches || [];

  const isLow = balance < 200;

  // Batch-wise usage table state
  const [batchSearch, setBatchSearch] = useState("");
  const [batchPage, setBatchPage] = useState(0);
  const [batchPageSize, setBatchPageSize] = useState(10);

  // Transactions table state
  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(0);
  const [txPageSize, setTxPageSize] = useState(10);

  const filteredBatchUsage = useMemo(() => {
    if (!batchSearch) return batchUsage || [];
    const term = batchSearch.toLowerCase();
    return (batchUsage || []).filter((b) => {
      return (
        b?.name?.toLowerCase?.().includes(term) ||
        b?.tier?.toLowerCase?.().includes(term)
      );
    });
  }, [batchUsage, batchSearch]);

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
    []
  );

  const filteredTransactions = useMemo(() => {
    if (!txSearch) return transactions || [];
    const term = txSearch.toLowerCase();
    return (transactions || []).filter((t) => {
      return (
        t?.description?.toLowerCase?.().includes(term) ||
        t?.status?.toLowerCase?.().includes(term) ||
        t?.type?.toLowerCase?.().includes(term)
      );
    });
  }, [transactions, txSearch]);

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
          const color =
            type === "credit" ? "text-emerald-600" : "text-red-600";
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
    [wallet?.currency]
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Credits</CardTitle>
              <p className="text-sm text-muted-foreground">
                Marketing & Utility credits
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-4xl font-bold">{format(balance)}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {tiers.map((tier) => (
                <span
                  key={tier}
                  className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-semibold text-primary"
                >
                  {tier}
                </span>
              ))}
            </div>
            <Button
              className="w-full"
              variant="outline"
              disabled={validating}
              onClick={onValidate}
            >
              {validating ? "Validating..." : "Validate balance before actions"}
            </Button>
          </CardContent>
        </Card>

        <WalletSummary
          balance={balance}
          summary={summary}
          merchantType="ANNUAL"
          className="lg:col-span-2"
        />
      </div>

      <WalletWarnings
        isLowBalance={isLow}
        expiresAt={summary?.expiresAt}
        merchantType="ANNUAL"
      />

      <section className="space-y-3">
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
      </section>

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
