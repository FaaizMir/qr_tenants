"use client";

import { useTranslations } from "next-intl";
import { AgentForm } from "./agent-form";

export default function CreateAgentContainer() {
  const t = useTranslations("agent.merchants");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 lg:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Onboard New Agent
        </h1>
        <p className="text-muted-foreground">
          Create a new agent account and configure their access and permissions.
        </p>
      </div>

      <AgentForm />
    </div>
  );
}
