"use client";

import { useState } from "react";
import { PageTabs } from "@/components/common/page-tabs";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { balances, transactions, autoDeductions } from "./wallet-data";
import { transactionColumns, deductionColumns } from "./wallet-columns";
import { getWalletTabs } from "./wallet-tabs";
import { useTranslations } from "next-intl";

export default function AgentWalletContainer() {
  const [txPage, setTxPage] = useState(0);
  const [txSize, setTxSize] = useState(10);
  const [txSearch, setTxSearch] = useState("");
  const tAgentWallet = useTranslations("dashboard.agentWallet");

  const TransactionColumns = transactionColumns(tAgentWallet);
  const DeductionColumns = deductionColumns(tAgentWallet);
  const filteredTx = transactions.filter((t) =>
    t.description.toLowerCase().includes(txSearch.toLowerCase())
  );

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
          total={filteredTx.length}
          setPage={setTxPage}
          setPageSize={setTxSize}
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
          onSearchChange={() => {}}
        />
        <DataTable data={autoDeductions} columns={DeductionColumns} />
      </CardContent>
    </Card>
  );

  const tabs = getWalletTabs({
    balances,
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
