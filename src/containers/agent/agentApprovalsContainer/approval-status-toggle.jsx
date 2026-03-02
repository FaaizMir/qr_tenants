"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";

export function ApprovalStatusToggle({
  initialStatus = false,
  merchantName = "this merchant",
  onStatusChange,
}) {
  const t = useTranslations("agentApprovals");
  // status: true/'approved' (Approved), false/'rejected' (Rejected), 'pending' (Pending)
  const [status, setStatus] = useState(initialStatus);
  const [localAction, setLocalAction] = useState(null); // 'approved' | 'rejected'

  const [pendingAction, setPendingAction] = useState(null); // 'approve' | 'reject'
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Rejection reason states
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState([]);

  // Sync state if props change (e.g. from parent re-fetch)
  useEffect(() => {
    setStatus(initialStatus);
    if (initialStatus === true || initialStatus === "approved") {
      setLocalAction("approved");
    } else if (initialStatus === false || initialStatus === "rejected") {
      setLocalAction("rejected");
    }
  }, [initialStatus]);

  // Fetch rejection reasons from API
  useEffect(() => {
    const fetchRejectionReasons = async () => {
      try {
        const response = await axiosInstance.get("/approvals/rejection-reasons");
        setRejectionReasons(response.data || []);
      } catch (error) {
        console.error("Error fetching rejection reasons:", error);
        // Fallback to default reasons if API fails
        setRejectionReasons([
          { value: "gambling_content", label: t("rejectionReasons.gamblingContent") },
          { value: "adult_sexual_content", label: t("rejectionReasons.adultContent") },
          { value: "illegal_services", label: t("rejectionReasons.illegalServices") },
          { value: "misleading_content", label: t("rejectionReasons.misleadingContent") },
          { value: "other", label: t("rejectionReasons.other") },
        ]);
      }
    };
    fetchRejectionReasons();
  }, [t]);

  const handleActionClick = (action) => {
    setPendingAction(action);
    setIsDialogOpen(true);
    // Reset rejection reason states when opening dialog
    if (action === "reject") {
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const handleConfirm = async () => {
    const isApprove = pendingAction === "approve";
    
    // Validate rejection reason if rejecting
    if (!isApprove) {
      if (!selectedReason) {
        toast.error(t("validation.selectReason"));
        return;
      }
      if (selectedReason === "other" && !customReason.trim()) {
        toast.error(t("validation.provideCustomReason"));
        return;
      }
    }
    
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous errors
    
    try {
      // Prepare rejection reason for API
      let disapprovalReason = null;
      if (!isApprove) {
        if (selectedReason === "other") {
          disapprovalReason = customReason.trim();
        } else {
          const reasonObj = rejectionReasons.find(r => r.value === selectedReason);
          disapprovalReason = reasonObj ? reasonObj.label : selectedReason;
        }
      }
      
      if (onStatusChange) {
        await onStatusChange(isApprove, disapprovalReason);
      }

      setStatus(isApprove);
      setLocalAction(isApprove ? "approved" : "rejected");
      toast.success(
        isApprove ? t("messages.approveSuccess") : t("messages.rejectSuccess")
      );
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Failed to ${pendingAction} request`, error);
      
      // Check if it's a slot limit error
      if (error.message && error.message.includes('not enough slots')) {
        setErrorMessage(error.message);
        // Keep dialog open to show the error
      } else {
        toast.error(
          error.message || 
          (isApprove ? t("messages.approveError") : t("messages.rejectError"))
        );
        setIsDialogOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isApproved =
    status === true || status === "approved" || localAction === "approved";
  const isRejected =
    status === false || status === "rejected" || localAction === "rejected";

  if (isApproved) {
    return (
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold shadow-sm animate-in fade-in zoom-in duration-300 w-fit">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t("status.approved")}
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-full text-[11px] font-bold shadow-sm animate-in fade-in zoom-in duration-300 w-fit">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {t("status.rejected")}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-start gap-2">
        <Button
          size="sm"
          className="h-8 px-3 text-[11px] text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-100 font-bold rounded-lg transition-all duration-200 active:scale-95 shadow-sm hover:shadow-emerald-200/50"
          onClick={() => handleActionClick("approve")}
        >
          <Check className="h-3.5 w-3.5 mr-1 stroke-[3px]" />
          {t("actions.approve")}
        </Button>
        <Button
          size="sm"
          className="h-8 px-3 text-[11px] text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-100 font-bold rounded-lg transition-all duration-200 active:scale-95 shadow-sm hover:shadow-rose-200/50"
          onClick={() => handleActionClick("reject")}
        >
          <X className="h-3.5 w-3.5 mr-1 stroke-[3px]" />
          {t("actions.reject")}
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => !open && !isLoading && setIsDialogOpen(false)}
      >
        <DialogContent className="max-w-[480px] w-[95vw] rounded-2xl p-6 border shadow-lg bg-white">
          <DialogHeader className="space-y-3">

            <div>
              <DialogTitle className="text-xl font-bold">
                {pendingAction === "approve" ? t("dialog.approveTitle") : t("dialog.rejectTitle")}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                {errorMessage ? (
                  <span className="text-rose-600 font-semibold">
                    {errorMessage}
                  </span>
                ) : (
                  <>
                    {pendingAction === "reject" ? (
                      t("dialog.rejectDescription", { merchantName })
                    ) : (
                      t("dialog.approveDescription", { merchantName })
                    )}
                  </>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Rejection Reasons - Only show when rejecting */}
          {pendingAction === "reject" && !errorMessage && (
            <div className="space-y-4 mt-4">
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                {rejectionReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label
                      htmlFor={reason.value}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Custom reason textarea - Only show when "Other" is selected */}
              {selectedReason === "other" && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="custom-reason" className="text-sm font-medium">
                    {t("rejectionReasons.title")}
                  </Label>
                  <Textarea
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={t("rejectionReasons.placeholder")}
                    className="min-h-20 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-lg font-semibold"
              onClick={() => {
                setIsDialogOpen(false);
                setErrorMessage(null);
              }}
              disabled={isLoading}
            >
              {errorMessage ? t("dialog.close") : t("dialog.cancel")}
            </Button>
            {!errorMessage && (
              <Button
                className={`flex-1 h-10 rounded-lg font-semibold text-white ${pendingAction === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  : "bg-rose-600 hover:bg-rose-700 shadow-sm"
                  }`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("dialog.processing")}
                  </div>
                ) : (
                  pendingAction === "approve" ? t("dialog.confirmApprove") : t("dialog.confirmReject")
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
