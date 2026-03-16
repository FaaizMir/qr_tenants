"use client";

import AgentLandingPage from "@/app/[locale]/homepage/agent";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function AgentHomepageById({ params }) {
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentByCompanyName = async () => {
      try {
        // Unwrap params for Next.js 15+
        const resolvedParams = await params;
        const companyNameFromUrl = resolvedParams.agentId;

        // Check if it's already a numeric ID
        if (!isNaN(companyNameFromUrl)) {
          setAgentId(companyNameFromUrl);
          setLoading(false);
          return;
        }

        // Fetch agents to find matching company name
        const response = await axiosInstance.get("/coupons/super-admin-feed", {
          params: {
            page: 1,
            pageSize: 100,
          },
        });

        const agentsData = response.data?.data?.admins || [];

        // Find agent by company name (case-insensitive match)
        const matchingAgent = agentsData.find(
          (agent) =>
            agent.company_name?.toLowerCase() ===
            companyNameFromUrl.toLowerCase(),
        );

        if (matchingAgent && matchingAgent.id) {
          setAgentId(matchingAgent.id);
        } else {
          setError("Agent not found");
        }
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError("Failed to load agent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentByCompanyName();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error || !agentId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Agent Not Found
          </h2>
          <p className="text-slate-500 mb-4">
            {error || "Unable to find the requested agent"}
          </p>
          <a href="/" className="text-primary hover:underline font-medium">
            Return to homepage
          </a>
        </div>
      </div>
    );
  }

  return <AgentLandingPage agentId={agentId} />;
}
