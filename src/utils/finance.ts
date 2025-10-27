import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  isAfter,
  isBefore,
  isWeekend,
  max,
  min,
  parseISO,
  startOfMonth,
} from "date-fns";
import type {
  ClientCompany,
  PayrollRecord,
  StaffMember,
} from "../types";

export interface CalculatedPayrollRecord extends PayrollRecord {
  month: string;
  daysWorked: number;
  totalWorkingDays: number;
  proration: number;
  billedAmount: number;
  baseSalaryAmount: number;
  transportationAmount: number;
  overtimeAmount: number;
  payableAmount: number;
  profit: number;
}

export const getMonthBounds = (month: string) => {
  const start = startOfMonth(parseISO(`${month}-01`));
  const end = endOfMonth(start);
  return { start, end };
};

const countWorkingDays = (start: Date, end: Date) => {
  if (isAfter(start, end)) return 0;
  const days = eachDayOfInterval({ start, end });
  return days.filter((day) => !isWeekend(day)).length;
};

const clampRangeToMonth = (record: PayrollRecord, month: string) => {
  const { start, end } = getMonthBounds(month);
  const recordStart = parseISO(record.startDate);
  const recordEnd = parseISO(record.endDate);

  const rangeStart = max([recordStart, start]);
  const rangeEnd = min([recordEnd, end]);

  if (isAfter(rangeStart, rangeEnd)) {
    return { start: rangeStart, end: rangeStart, daysWorked: 0 };
  }

  const daysWorked = countWorkingDays(rangeStart, rangeEnd);

  return { start: rangeStart, end: rangeEnd, daysWorked };
};

export const calculateRecordFinancials = (
  record: PayrollRecord,
  month: string,
): CalculatedPayrollRecord => {
  const { start, end } = getMonthBounds(month);
  const totalWorkingDays = countWorkingDays(start, end);
  const { daysWorked } = clampRangeToMonth(record, month);
  const effectiveDays = record.fullMonth ? totalWorkingDays : daysWorked;
  const proration =
    totalWorkingDays === 0
      ? 0
      : record.fullMonth
        ? 1
        : Math.min(1, effectiveDays / totalWorkingDays);

  const billedAmount = record.contractAmount * proration;
  const baseSalaryAmount = record.salary * proration;
  const transportationAmount = record.transportation * proration;
  const dailySalary =
    totalWorkingDays > 0 ? record.salary / totalWorkingDays : record.salary;
  const overtimeAmount = record.overtimeDays * dailySalary;

  const payableAmount =
    baseSalaryAmount + transportationAmount + overtimeAmount - record.fines;

  const profit = billedAmount - payableAmount;

  return {
    ...record,
    month,
    daysWorked: effectiveDays,
    totalWorkingDays,
    proration,
    billedAmount,
    baseSalaryAmount,
    transportationAmount,
    overtimeAmount,
    payableAmount,
    profit,
  };
};

export const calculateMonthlyFinancials = (
  records: PayrollRecord[],
  staff: StaffMember[],
  month: string,
) => {
  const calculated = records.map((record) =>
    calculateRecordFinancials(record, month),
  );

  const billedIncome = calculated.reduce(
    (total, record) => total + record.billedAmount,
    0,
  );
  const nurseExpenses = calculated.reduce(
    (total, record) => total + record.payableAmount,
    0,
  );

  const grossProfit = billedIncome - nurseExpenses;
  const staffCost = staff.reduce((sum, employee) => sum + employee.monthlySalary, 0);
  const netProfit = grossProfit - staffCost;
  const profitMargin = billedIncome > 0 ? (netProfit / billedIncome) * 100 : 0;

  return {
    calculated,
    billedIncome,
    nurseExpenses,
    grossProfit,
    staffCost,
    netProfit,
    profitMargin,
  };
};

export const calculateClientBreakdown = (
  records: CalculatedPayrollRecord[],
  clients: ClientCompany[],
) => {
  const map = new Map<
    string,
    {
      client: ClientCompany;
      income: number;
      expenses: number;
      profit: number;
      margin: number;
    }
  >();

  records.forEach((record) => {
    const client = clients.find((item) => item.id === record.clientId);
    if (!client) return;

    const current = map.get(client.id) ?? {
      client,
      income: 0,
      expenses: 0,
      profit: 0,
      margin: 0,
    };

    current.income += record.billedAmount;
    current.expenses += record.payableAmount;
    current.profit += record.profit;

    map.set(client.id, current);
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    margin: entry.income > 0 ? (entry.profit / entry.income) * 100 : 0,
  }));
};

export const getMonthLabel = (month: string) => {
  const base = parseISO(`${month}-01`);
  return base.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

export const getNextInvoiceNumber = (currentCount: number, prefix = "INV") => {
  const sequence = String(currentCount + 1).padStart(4, "0");
  return `${prefix}-${sequence}`;
};

export const iterateMonthsBackwards = (count = 12) => {
  const today = new Date();
  const months: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const date = addDays(startOfMonth(today), -30 * index);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!months.includes(label)) {
      months.push(label);
    }
  }
  return months;
};

export const recordMatchesMonth = (record: PayrollRecord, month: string) => {
  const { start, end } = getMonthBounds(month);
  const recordStart = parseISO(record.startDate);
  const recordEnd = parseISO(record.endDate);
  return !(isAfter(recordStart, end) || isBefore(recordEnd, start));
};
