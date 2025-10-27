import type { ClientCompany, Nurse } from "../types";
import type { CalculatedPayrollRecord } from "./finance";

const escapeCsv = (value: string | number) => {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const downloadCsv = (
  records: CalculatedPayrollRecord[],
  nurses: Nurse[],
  clients: ClientCompany[],
  currency: string,
  month: string,
) => {
  const headers = [
    "Payroll ID",
    "Month",
    "Nurse",
    "Client",
    "Start Date",
    "End Date",
    "Days Worked",
    "Contract Amount",
    "Billed Amount",
    "Nurse Salary",
    "Transportation",
    "Overtime Days",
    "Overtime Amount",
    "Fines / Deductions",
    "Payable Amount",
    "Profit",
  ];

  const rows = records.map((record) => {
    const nurse = nurses.find((item) => item.id === record.nurseId);
    const client = clients.find((item) => item.id === record.clientId);

    return [
      record.id,
      month,
      nurse?.name ?? "Unknown Nurse",
      client?.name ?? "Unknown Client",
      record.startDate,
      record.endDate,
      record.daysWorked,
      record.contractAmount.toFixed(2),
      record.billedAmount.toFixed(2),
      record.baseSalaryAmount.toFixed(2),
      record.transportationAmount.toFixed(2),
      record.overtimeDays,
      record.overtimeAmount.toFixed(2),
      record.fines.toFixed(2),
      record.payableAmount.toFixed(2),
      record.profit.toFixed(2),
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `payroll-${month}-${currency}-${timestamp}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
