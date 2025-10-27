export type CurrencyCode = "AED" | "USD" | "EUR" | "GBP" | "SAR";

export interface Nurse {
  id: string;
  name: string;
  defaultSalary: number;
  defaultTransportation: number;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  monthlySalary: number;
  createdAt: string;
}

export interface ClientCompany {
  id: string;
  name: string;
  trn?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  nurseId: string;
  clientId: string;
  contractAmount: number;
  salary: number;
  transportation: number;
  overtimeDays: number;
  fines: number;
  startDate: string;
  endDate: string;
  fullMonth: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyTrn?: string;
  currency: CurrencyCode;
  vatRate: number;
  bankName: string;
  bankAccountNumber: string;
  iban: string;
  bankCompanyTrn?: string;
  headerImage?: string;
  footerImage?: string;
  contactNote: string;
}

export interface DataState {
  nurses: Nurse[];
  staff: StaffMember[];
  clients: ClientCompany[];
  payrollRecords: PayrollRecord[];
  settings: CompanySettings;
}

export interface AnalyticsSummary {
  month: string;
  billedIncome: number;
  nurseExpenses: number;
  grossProfit: number;
  staffCost: number;
  netProfit: number;
  profitMargin: number;
}
