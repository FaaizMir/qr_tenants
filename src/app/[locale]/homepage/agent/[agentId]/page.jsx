import AgentLandingPage from "@/app/[locale]/homepage/agent";
import React from "react";

export default async function AgentHomepageById({ params }) {
  const { agentId } = await params;
  return (
    <>
      <AgentLandingPage agentId={agentId} />
    </>
  );
}
