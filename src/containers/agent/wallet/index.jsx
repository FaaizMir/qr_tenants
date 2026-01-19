"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTabs } from "@/components/common/page-tabs";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { autoDeductions } from "./wallet-data";
import { transactionColumns, deductionColumns } from "./wallet-columns";
import { getWalletTabs } from "./wallet-tabs";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import useDebounce from "@/hooks/useDebounceRef";

export default function AgentWalletContainer() {
  const { data: session } = useSession();
  const adminId = session?.user?.adminId;

  const tAgentWallet = useTranslations("dashboard.agentWallet");

  /** Pagination + search */
  const [txPage, setTxPage] = useState(0);
  const [txSize, setTxSize] = useState(10);
  const [txSearch, setTxSearch] = useState("");
  const debouncedTxSearch = useDebounce(txSearch, 500);

  /** Wallet stats */
  const [walletStats, setWalletStats] = useState({
    balance: 0,
    pending_amount: 0,
    total_earnings: 0,
    total_spent: 0,
    currency: "USD",
    is_active: false,
    subscription_type: null,
    subscription_expires_at: null,
    admin: null,
  });

  /** Transactions */
  const [transactions, setTransactions] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const TransactionColumns = transactionColumns(tAgentWallet);
  const DeductionColumns = deductionColumns(tAgentWallet);

  /* ----------------------------------
   * Fetch wallet stats
   * ---------------------------------- */
  useEffect(() => {
    if (!adminId) return;

    const fetchWallet = async () => {
      try {
        const res = await axiosInstance.get(`/wallets/admin/${adminId}`);
        const wallet = res.data;

        setWalletStats({
          balance: Number(wallet.balance),
          pending_amount: Number(wallet.pending_amount),
          total_earnings: Number(wallet.total_earnings),
          total_spent: Number(wallet.total_spent),
          currency: wallet.currency,
          is_active: wallet.is_active,
          subscription_type: wallet.subscription_type,
          subscription_expires_at: wallet.subscription_expires_at,
          admin: wallet.admin,
        });
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      }
    };

    fetchWallet();
  }, [adminId]);

  /* ----------------------------------
   * Fetch transactions (paginated)
   * ---------------------------------- */
  useEffect(() => {
    if (!adminId) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/wallets/admin/${adminId}/transactions`,
          {
            params: {
              page: txPage + 1, // backend is 1-based
              limit: txSize,
            },
          }
        );

        setTransactions(res.data.data || []);
        setTxTotal(res.data.meta.total || 0);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [adminId, txPage, txSize]);

  /* ----------------------------------
   * Search (client-side)
   * ---------------------------------- */
  const filteredTx = useMemo(() => {
    if (!debouncedTxSearch) return transactions;
    return transactions.filter((t) =>
      t.description?.toLowerCase().includes(debouncedTxSearch.toLowerCase())
    );
  }, [transactions, debouncedTxSearch]);

  /* ----------------------------------
   * Tables
   * ---------------------------------- */
  const transactionTable = (
    <Card>
      <CardHeader>
        <CardTitle>{tAgentWallet("transactionhistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder={tAgentWallet("searchtransactions")}
          onSearchChange={setTxSearch}
        />

        <DataTable
          data={filteredTx}
          columns={TransactionColumns}
          page={txPage}
          pageSize={txSize}
          total={txTotal}
          setPage={setTxPage}
          setPageSize={setTxSize}
          loading={loading}
        />
      </CardContent>
    </Card>
  );

  const deductionTable = (
    <Card>
      <CardHeader>
        <CardTitle>{tAgentWallet("autodeductionslog")}</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder={tAgentWallet("searchdeductions")}
          onSearchChange={() => { }}
        />
        <DataTable data={autoDeductions} columns={DeductionColumns} />
      </CardContent>
    </Card>
  );

  const tabs = getWalletTabs({
    walletStats,
    transactions,
    deductions: autoDeductions,
    transactionTable,
    deductionTable,
    tAgentWallet,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{tAgentWallet("agentwallet")}</h1>
        <p className="text-muted-foreground">{tAgentWallet("description")}</p>
      </div>

      <PageTabs tabs={tabs} defaultTab="balance" />
    </div>
  );
}
