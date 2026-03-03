"use client";

import { useTranslations } from "next-intl";
import { AgentForm } from "./agent-form";

export default function CreateAgentContainer() {
  const t = useTranslations("masterAdminAgents.create");
  
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 lg:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <AgentForm />
    </div>
  );
}
