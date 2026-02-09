import SystemLogsContainer from "@/containers/logs/system-logs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default async function MerchantLogsPage() {
  const session = await getServerSession(authOptions);
  const merchantId = session?.user?.merchantId;
  const breadcrumbData = [
    { name: "Merchant Dashboard", url: "/merchant/dashboard" },
    { name: "System Logs", url: "/merchant/logs" },
  ];
  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Store Logs</h1>
          <p className="text-muted-foreground">
            Track your store&apos;s operations, coupon usage, and customer
            interactions.
          </p>
        </div>
        <SystemLogsContainer scope="merchant" merchantId={merchantId} />
      </div>
    </>
  );
}
