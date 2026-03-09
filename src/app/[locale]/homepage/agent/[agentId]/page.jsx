import AgentLandingPage from "@/app/[locale]/homepage/agent";
import React from "react";

export default function AgentHomepageById({ params }) {
  return (
    <>
      <AgentLandingPage agentId={params.agentId} />
    </>
  );
}
