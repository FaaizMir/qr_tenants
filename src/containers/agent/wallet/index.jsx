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

export default function AgentWalletContainer() {
  const [txPage, setTxPage] = useState(0);
  const [txSize, setTxSize] = useState(10);
  const [txSearch, setTxSearch] = useState("");

  const filteredTx = transactions.filter((t) =>
    t.description.toLowerCase().includes(txSearch.toLowerCase())
  );

  const transactionTable = (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder="Search transactions..."
          onSearchChange={setTxSearch}
        />
        <DataTable
          data={filteredTx}
          columns={transactionColumns}
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
        <CardTitle>Auto-Deductions Log</CardTitle>
      </CardHeader>
      <CardContent>
        <TableToolbar
          placeholder="Search deductions..."
          onSearchChange={() => {}}
        />
        <DataTable data={autoDeductions} columns={deductionColumns} />
      </CardContent>
    </Card>
  );

  const tabs = getWalletTabs({
    balances,
    transactions,
    deductions: autoDeductions,
    transactionTable,
    deductionTable,
  });

  return (
    <div className="space-y-6">
      <PageTabs tabs={tabs} defaultTab="balance" />
    </div>
  );
}
