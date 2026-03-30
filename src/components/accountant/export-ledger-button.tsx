"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportLedgerButtonProps {
  data: any[];
  month: string;
}

export function ExportLedgerButton({ data, month }: ExportLedgerButtonProps) {
  const handleExport = () => {
    const headers = [
      "Name",
      "Designation",
      "Present Days",
      "Late Marks",
      "LWP Days",
      "P1 Balance",
      "Encashable Days",
      "P2 Balance"
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = data.map(row => [
      escapeCSV(row.name),
      escapeCSV(row.role),
      escapeCSV(row.totalPresent),
      escapeCSV(row.totalLate),
      escapeCSV(row.lwpDays.toFixed(1)),
      escapeCSV(row.balances.full),
      escapeCSV(row.encashableDays),
      escapeCSV(row.balances.semiAnnual)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_ledger_${month.toLowerCase()}_${new Date().getFullYear()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="h-9 text-[10px] font-bold uppercase tracking-widest border-border bg-background hover:bg-muted transition-colors"
    >
      <Download className="w-3.5 h-3.5 mr-2" />
      Export Ledger
    </Button>
  );
}
