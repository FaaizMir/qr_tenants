"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import { getApprovalColumns } from "./approval-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function AgentApprovalsContainer() {

    const { data: session } = useSession();
    const adminId = session?.adminId;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        if (!adminId) return;

        const fetchApprovals = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/admins/${adminId}/approvals`);
                const items = response.data || [];

                // Map API response to table shape
                const mappedData = items.map(item => {
                    // Based on API response, image is in merchant.settings.paid_ad_image
                    const relativePath = item.merchant?.settings?.paid_ad_image;
                    let fullImageUrl = null;

                    if (relativePath) {
                        if (relativePath.startsWith("http") || relativePath.startsWith("data:")) {
                            fullImageUrl = relativePath;
                        } else {
                            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";
                            const cleanPath = relativePath.replace(/^\/+/, "");
                            fullImageUrl = `${baseUrl}/${cleanPath}`;
                        }
                    }


                    return {
                        id: item.id,
                        name: item.merchant?.business_name || "N/A",
                        email: item.merchant?.user?.email || null,
                        adImage: fullImageUrl,
                        approvalType: item.approval_type,
                        location: [item.merchant?.city, item.merchant?.country].filter(Boolean).join(", ") || "N/A",
                        status: item.approval_status,
                        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A",
                        raw: item
                    };
                });




                setData(mappedData);
            } catch (error) {
                console.error("Error fetching approvals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApprovals();
    }, [adminId]);

    const handleStatusUpdate = async (id, newStatus) => {
        const action = newStatus ? "approve" : "reject";
        try {
            await axiosInstance.patch(`/approvals/${adminId}/${action}`, {
                id: id,
                approval_status: newStatus
            });

            // Update local state to reflect change immediately
            setData(prevData => prevData.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));

            return true;
        } catch (error) {
            console.error(`Error ${action}ing approval:`, error);
            throw error; // Re-throw so the UI can handle it
        }
    };

    const columns = useMemo(() => getApprovalColumns(handleStatusUpdate), []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Approvals</h1>
                <p className="text-muted-foreground">Manage agent approvals</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={data}
                        columns={columns}
                        page={page}
                        pageSize={pageSize}
                        total={data.length} // Client-side pagination for now since API might not return meta
                        setPage={setPage}
                        setPageSize={setPageSize}
                        isLoading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
