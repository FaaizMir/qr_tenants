"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function ApprovalStatusToggle({
    initialStatus = false,
    merchantName = "this merchant",
    onStatusChange,
}) {
    // status: true/'approved' (Approved), false/'rejected' (Rejected), 'pending' (Pending)
    const [status, setStatus] = useState(initialStatus);
    const [localAction, setLocalAction] = useState(null); // 'approved' | 'rejected'

    const [pendingAction, setPendingAction] = useState(null); // 'approve' | 'reject'
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state if props change (e.g. from parent re-fetch)
    useEffect(() => {
        setStatus(initialStatus);
        if (initialStatus === true || initialStatus === "approved") {
            setLocalAction("approved");
        } else if (initialStatus === false || initialStatus === "rejected") {
            setLocalAction("rejected");
        }
    }, [initialStatus]);

    const handleActionClick = (action) => {
        setPendingAction(action);
        setIsDialogOpen(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        const isApprove = pendingAction === "approve";
        try {
            if (onStatusChange) {
                await onStatusChange(isApprove);
            }

            setStatus(isApprove);
            setLocalAction(isApprove ? 'approved' : 'rejected');
            toast.success(`Request ${isApprove ? "approved" : "rejected"} successfully`);
            setIsDialogOpen(false);
        } catch (error) {
            console.error(`Failed to ${pendingAction} request`, error);
            toast.error(`Failed to ${pendingAction} request`);
        } finally {
            setIsLoading(false);
        }
    };

    const isApproved = status === true || status === "approved" || localAction === "approved";
    const isRejected = status === false || status === "rejected" || localAction === "rejected";

    if (isApproved) {
        return (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 h-7">
                Approved
            </Badge>
        );
    }

    if (isRejected) {
        return (
            <Badge variant="outline" className="text-rose-600 border-rose-200 h-7">
                Rejected
            </Badge>
        );
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => handleActionClick("approve")}
                >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleActionClick("reject")}
                >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && !isLoading && setIsDialogOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {pendingAction === "approve" ? (
                                <Check className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <X className="h-5 w-5 text-rose-600" />
                            )}
                            {pendingAction === "approve" ? "Approve" : "Reject"} Request
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to <span className="font-bold uppercase tracking-wide">{pendingAction}</span> the request for{" "}
                            <span className="font-semibold text-slate-900">{merchantName}</span>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant={pendingAction === "approve" ? "default" : "destructive"}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : pendingAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
