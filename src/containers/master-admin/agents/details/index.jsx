"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit,
  ArrowLeft,
  Loader2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";

export default function AgentDetailContainer({ agentId }) {
  const t = useTranslations("masterAdminAgents.details");
  const tMessages = useTranslations("masterAdminAgents.messages");
  const tStatus = useTranslations("masterAdminAgents.status");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/admins/${agentId}`);
        const data = response.data;
        setAgent(data?.data || data);
      } catch (error) {
        console.error("Failed to fetch agent details:", error);
        toast.error(tMessages("fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId, tMessages]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("goBack")}
        </Button>
      </div>
    );
  }

  const user = agent.user || {};
  const status = agent.is_active ?? user.is_active ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {user.name || agent.name || "Unnamed Agent"}
              </h1>
              <Badge
                variant={status ? "default" : "destructive"}
                className="capitalize"
              >
                {status ? tStatus("active") : tStatus("inactive")}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> {user.email || agent.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/master-admin/agents/edit/${agentId}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> {t("editAgent")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t("accountInformation.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("accountInformation.fullName")}
                </p>
                <p className="text-base font-semibold">
                  {user.name || agent.name || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("accountInformation.emailAddress")}
                </p>
                <p className="text-base font-semibold">
                  {user.email || agent.email || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("accountInformation.phoneNumber")}
                </p>
                <p className="text-base font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user.phone || agent.phone || agent.phone_number || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("accountInformation.memberSince")}
                </p>
                <p className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {agent.created_at
                    ? new Date(agent.created_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                {t("locationDetails.title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("locationDetails.fullAddress")}
                  </p>
                  <p className="text-base font-semibold">
                    {agent.address || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("locationDetails.city")}
                  </p>
                  <p className="text-base font-semibold">{agent.city || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("locationDetails.country")}
                  </p>
                  <p className="text-base font-semibold">
                    {agent.country || "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action / Status Card */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t("accessControl.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{t("accessControl.status")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("accessControl.statusDescription")}
                  </p>
                </div>
                <Badge variant={status ? "default" : "destructive"}>
                  {status ? tStatus("active") : tStatus("inactive")}
                </Badge>
              </div>
         
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
