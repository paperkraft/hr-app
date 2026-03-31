"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";
import { updateLeaveStatus } from "@/actions/leave";

type PendingRequest = {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  duration: string;
  category: string;
  reason: string;
  startTime?: string | null;
  endTime?: string | null;
};

export function LeaveApprovalRow({ request }: { request: PendingRequest }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    setIsProcessing(true);
    try {
      const result = await updateLeaveStatus(request.id, action, rejectionNote);
      if (result.error) {
        alert(result.error);
      } else {
        setIsRejecting(false);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-middle font-medium">{request.employeeName}</td>
      <td className="p-4 align-middle">
        <div className="flex flex-col">
          <span className="text-sm">{request.startDate} to {request.endDate}</span>
          <span className="text-xs text-muted-foreground italic font-medium">
            {request.duration} 
            {request.duration === "SHORT" && request.startTime && ` (${request.startTime} - ${request.endTime})`} 
            • {request.category === "MONTHLY_POLICY_1" ? "Policy 1" : request.category === "UNPAID" ? "Unpaid" : "Policy 2"}
          </span>
        </div>
      </td>
      <td className="p-4 align-middle text-sm text-muted-foreground max-w-50 truncate" title={request.reason}>
        {request.reason}
      </td>
      <td className="p-4 align-middle text-right">
        {isRejecting ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Reason for rejection..."
              className="text-xs p-2 border border-border rounded-md bg-muted/20 focus:outline-none focus:ring-1 focus:ring-destructive/50"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setIsRejecting(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-[10px] font-bold uppercase tracking-tight"
                onClick={() => handleAction("REJECTED")}
                disabled={isProcessing}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive border-destructive/20 hover:!text-white"
              onClick={() => setIsRejecting(true)}
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAction("APPROVED")}
              disabled={isProcessing}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}