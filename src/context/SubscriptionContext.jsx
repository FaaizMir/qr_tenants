"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
    const { data: session, update } = useSession();
    const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(
        session?.user?.is_subscription_expired ?? false
    );
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const adminId = session?.user?.adminId;

    const refreshSubscription = useCallback(async () => {
        if (!adminId) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`/wallets/admin/${adminId}`);
            const data = res.data;

            setIsSubscriptionExpired(data.is_subscription_expired);
            setSubscriptionData(data);

            // Sync with NextAuth session
            await update({
                is_subscription_expired: data.is_subscription_expired,
                subscription_expires_at: data.subscription_expires_at,
            });

            return data;
        } catch (error) {
            console.error("Failed to refresh subscription:", error);
        } finally {
            setLoading(false);
        }
    }, [adminId, update]);

    const hasFetchedOnMount = React.useRef(false);

    // Fetch latest status on mount if user is an agent/admin
    useEffect(() => {
        if (!session?.user || hasFetchedOnMount.current) {
            if (session === null) setIsInitializing(false);
            return;
        }

        const isAgent = session?.user?.role === "agent" || session?.user?.role === "admin";

        const checkStatus = async () => {
            if (isAgent && adminId) {
                hasFetchedOnMount.current = true;
                await refreshSubscription();
            }
            setIsInitializing(false);
        };

        checkStatus();
    }, [adminId, session?.user?.role, refreshSubscription, session]);

    // Keep local state in sync with session updates from other tabs/actions
    useEffect(() => {
        if (session?.user?.is_subscription_expired !== undefined) {
            setIsSubscriptionExpired(session.user.is_subscription_expired);
        }
    }, [session?.user?.is_subscription_expired]);

    return (
        <SubscriptionContext.Provider value={{
            isSubscriptionExpired,
            subscriptionData,
            refreshSubscription,
            loading,
            isInitializing
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}
