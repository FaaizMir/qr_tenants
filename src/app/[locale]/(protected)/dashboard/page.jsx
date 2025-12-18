import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import {
  Users,
  Store,
  MessageSquare,
  Ticket,
  TrendingUp,
  DollarSign,
  CreditCard,
  QrCode,
  BarChart3,
  PieChart,
} from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function Page() {
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');

  const breadcrumbData = [{ name: t('title'), url: "/dashboard" }];

  return (
    <>
      <BreadcrumbComponent data={breadcrumbData} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('totalRevenue')}
              </p>
              <p className="text-2xl font-bold text-foreground">$125,450.00</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +18.5% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('merchants')}
              </p>
              <p className="text-2xl font-bold text-foreground">342</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.3% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-secondary-accent/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary-accent" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('whiteLabelAgents')}
              </p>
              <p className="text-2xl font-bold text-foreground">1,856</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +24.7% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-info/10 rounded-lg flex items-center justify-center">
              <Store className="h-6 w-6 text-info" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('totalFeedbacks')}
              </p>
              <p className="text-2xl font-bold text-foreground">8,923</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +31.2% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('activeSubscriptions')}
              </p>
              <p className="text-2xl font-bold text-foreground">298</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('monthlyRecurring')}
              </p>
            </div>
            <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-warning" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('couponsIssued')}
              </p>
              <p className="text-2xl font-bold text-foreground">6,542</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15.8% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Ticket className="h-6 w-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('qrCodesScanned')}
              </p>
              <p className="text-2xl font-bold text-foreground">12,847</p>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +28.4% {t('fromLastMonth')}
              </p>
            </div>
            <div className="h-12 w-12 bg-info/10 rounded-lg flex items-center justify-center">
              <QrCode className="h-6 w-6 text-info" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('pointsPurchased')}
              </p>
              <p className="text-2xl font-bold text-foreground">2.4M</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('totalPointsSold')}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t('revenueOverview')}
            </h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[65, 45, 80, 55, 70, 85, 60, 75, 90, 65, 80, 95].map(
              (height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-6 bg-primary rounded-t-sm"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ][index]
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t('userDistribution')}
            </h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[
              { name: t('merchants'), value: 35, color: "bg-primary" },
              { name: t('whiteLabelAgents'), value: 45, color: "bg-info" },
              { name: "Customers", value: 15, color: "bg-success" },
              { name: "Others", value: 5, color: "bg-muted" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedbacks Table */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {t('recentFeedbacks')}
          </h3>
          <Link href="/feedbacks" className="text-sm text-primary hover:text-primary-hover font-medium">
            {tCommon('viewAll')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('feedbackId')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('customer')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('whiteLabelAgent')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('rating')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('date')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "#FB-001",
                  customer: "John Doe",
                  agent: "Store ABC",
                  rating: "5",
                  date: "2024-01-15",
                  status: "approved",
                },
                {
                  id: "#FB-002",
                  customer: "Jane Smith",
                  agent: "Store XYZ",
                  rating: "4",
                  date: "2024-01-15",
                  status: "pending",
                },
                {
                  id: "#FB-003",
                  customer: "Mike Johnson",
                  agent: "Store DEF",
                  rating: "5",
                  date: "2024-01-14",
                  status: "approved",
                },
                {
                  id: "#FB-004",
                  customer: "Sarah Wilson",
                  agent: "Store GHI",
                  rating: "3",
                  date: "2024-01-14",
                  status: "approved",
                },
                {
                  id: "#FB-005",
                  customer: "David Brown",
                  agent: "Store JKL",
                  rating: "4",
                  date: "2024-01-13",
                  status: "pending",
                },
              ].map((feedback, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">
                    {feedback.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {feedback.customer}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {feedback.agent}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {feedback.rating} ⭐
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {feedback.date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.status === "approved"
                          ? "bg-success-light text-success"
                          : "bg-warning-light text-warning"
                      }`}>
                      {t(feedback.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

