"use client";

import { useEffect, useState } from "react";
import { Lock, Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import axios from "@/lib/axios";
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
import useDebounce from "@/hooks/useDebounceRef";
import { getCustomersColumns } from "./customers-columns";

export default function MerchantCustomerDataContainer() {
  const t = useTranslations("merchantCustomerData.index");
  const tColumns = useTranslations("merchantCustomerData.columns");
  const { data: session, status } = useSession();

  const loadingSession = status === "loading";
  const subscription = session?.user?.subscriptionType ?? "temporary";

  const [customers, setCustomers] = useState();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (subscription !== "annual") return;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/customers", {
          params: {
            page: page + 1,
            pageSize,
            search: debouncedSearch,
          },
        });
        setCustomers(res.data.data);
        setTotal(res.data.meta.total);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page, pageSize, debouncedSearch, subscription]);

  if (loadingSession) return null;

  if (subscription !== "annual") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center space-y-6">
        <div className="bg-muted p-6 rounded-full">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-3xl font-bold">{t("locked.title")}</h1>
          <p className="text-muted-foreground">{t("locked.description")}</p>
        </div>
        <Card className="max-w-sm w-full border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{t("locked.upgradeCard.title")}</CardTitle>
            <CardDescription>
              {t("locked.upgradeCard.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-left list-disc list-inside">
              <li>{t("locked.upgradeCard.features.feature1")}</li>
              <li>{t("locked.upgradeCard.features.feature2")}</li>
              <li>{t("locked.upgradeCard.features.feature3")}</li>
              <li>{t("locked.upgradeCard.features.feature4")}</li>
            </ul>
            <Button className="w-full">
              {t("locked.upgradeCard.upgradeButton")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <TableToolbar
            placeholder={t("searchPlaceholder")}
            onSearchChange={(value) => {
              setPage(0);
              setSearch(value);
            }}
          />
          <DataTable
            data={customers}
            columns={getCustomersColumns(tColumns)}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
