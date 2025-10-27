import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ClientCompany,
  type CompanySettings,
  type DataState,
  type Nurse,
  type PayrollRecord,
  type StaffMember,
} from "../types";
import { generateId } from "../lib/utils";

const STORAGE_KEY = "safe-haven-health-data-v1";

const defaultSettings: CompanySettings = {
  companyName: "Safe Heaven Health",
  currency: "AED",
  vatRate: 5,
  bankName: "",
  bankAccountNumber: "",
  iban: "",
  contactNote: "For queries, please contact finance@safeheavenhealth.com",
  companyTrn: "",
  bankCompanyTrn: "",
};

const defaultState: DataState = {
  nurses: [],
  staff: [],
  clients: [],
  payrollRecords: [],
  settings: defaultSettings,
};

interface UpsertNurseInput {
  id?: string;
  name: string;
  defaultSalary: number;
  defaultTransportation: number;
}

interface UpsertStaffInput {
  id?: string;
  name: string;
  designation: string;
  monthlySalary: number;
}

interface UpsertClientInput {
  id?: string;
  name: string;
  trn?: string;
}

interface UpsertPayrollInput
  extends Omit<
    PayrollRecord,
    "id" | "createdAt"
  > {
  id?: string;
}

interface DataContextValue extends DataState {
  upsertNurse: (payload: UpsertNurseInput) => void;
  deleteNurse: (id: string) => void;
  upsertStaff: (payload: UpsertStaffInput) => void;
  deleteStaff: (id: string) => void;
  upsertClient: (payload: UpsertClientInput) => void;
  deleteClient: (id: string) => void;
  upsertPayroll: (payload: UpsertPayrollInput) => void;
  deletePayroll: (id: string) => void;
  updateSettings: (payload: Partial<CompanySettings>) => void;
  resetAll: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const isBrowser = typeof window !== "undefined";

const parseState = (raw: string | null): DataState => {
  if (!raw) return defaultState;

  try {
    const parsed = JSON.parse(raw) as Partial<DataState>;
    return {
      nurses: parsed.nurses ?? [],
      staff: parsed.staff ?? [],
      clients: parsed.clients ?? [],
      payrollRecords: parsed.payrollRecords ?? [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    };
  } catch (error) {
    console.warn("[DataContext] Failed to parse storage payload", error);
    return defaultState;
  }
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<DataState>(() =>
    isBrowser ? parseState(window.localStorage.getItem(STORAGE_KEY)) : defaultState,
  );

  useEffect(() => {
    if (!isBrowser) return;
    const payload = window.localStorage.getItem(STORAGE_KEY);
    if (payload) {
      setState(parseState(payload));
    }
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const upsertNurse = useCallback((payload: UpsertNurseInput) => {
    setState((prev) => {
      const exists = payload.id
        ? prev.nurses.find((item) => item.id === payload.id)
        : undefined;
      const nurse: Nurse = {
        id: payload.id ?? generateId(),
        name: payload.name.trim(),
        defaultSalary: Number(payload.defaultSalary),
        defaultTransportation: Number(payload.defaultTransportation),
        createdAt: exists?.createdAt ?? new Date().toISOString(),
      };

      const nurses = exists
        ? prev.nurses.map((item) => (item.id === nurse.id ? nurse : item))
        : [...prev.nurses, nurse];

      return { ...prev, nurses };
    });
  }, []);

  const deleteNurse = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nurses: prev.nurses.filter((item) => item.id !== id),
      payrollRecords: prev.payrollRecords.filter((record) => record.nurseId !== id),
    }));
  }, []);

  const upsertStaff = useCallback((payload: UpsertStaffInput) => {
    setState((prev) => {
      const exists = payload.id
        ? prev.staff.find((item) => item.id === payload.id)
        : undefined;
      const staffMember: StaffMember = {
        id: payload.id ?? generateId(),
        name: payload.name.trim(),
        designation: payload.designation.trim(),
        monthlySalary: Number(payload.monthlySalary),
        createdAt: exists?.createdAt ?? new Date().toISOString(),
      };

      const staff = exists
        ? prev.staff.map((item) => (item.id === staffMember.id ? staffMember : item))
        : [...prev.staff, staffMember];

      return { ...prev, staff };
    });
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      staff: prev.staff.filter((item) => item.id !== id),
    }));
  }, []);

  const upsertClient = useCallback((payload: UpsertClientInput) => {
    setState((prev) => {
      const exists = payload.id
        ? prev.clients.find((item) => item.id === payload.id)
        : undefined;
      const client: ClientCompany = {
        id: payload.id ?? generateId(),
        name: payload.name.trim(),
        trn: payload.trn?.trim() || undefined,
        createdAt: exists?.createdAt ?? new Date().toISOString(),
      };

      const clients = exists
        ? prev.clients.map((item) => (item.id === client.id ? client : item))
        : [...prev.clients, client];

      return { ...prev, clients };
    });
  }, []);

  const deleteClient = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.filter((item) => item.id !== id),
      payrollRecords: prev.payrollRecords.filter((record) => record.clientId !== id),
    }));
  }, []);

  const upsertPayroll = useCallback((payload: UpsertPayrollInput) => {
    setState((prev) => {
      const exists = payload.id
        ? prev.payrollRecords.find((item) => item.id === payload.id)
        : undefined;
      const record: PayrollRecord = {
        id: payload.id ?? generateId(),
        nurseId: payload.nurseId,
        clientId: payload.clientId,
        contractAmount: Number(payload.contractAmount),
        salary: Number(payload.salary),
        transportation: Number(payload.transportation),
        overtimeDays: Number(payload.overtimeDays),
        fines: Number(payload.fines),
        startDate: payload.startDate,
        endDate: payload.endDate,
        fullMonth: payload.fullMonth,
        createdAt: exists?.createdAt ?? new Date().toISOString(),
      };

      const payrollRecords = exists
        ? prev.payrollRecords.map((item) => (item.id === record.id ? record : item))
        : [...prev.payrollRecords, record];

      return { ...prev, payrollRecords };
    });
  }, []);

  const deletePayroll = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      payrollRecords: prev.payrollRecords.filter((item) => item.id !== id),
    }));
  }, []);

  const updateSettings = useCallback((payload: Partial<CompanySettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...payload },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
    if (isBrowser) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      upsertNurse,
      deleteNurse,
      upsertStaff,
      deleteStaff,
      upsertClient,
      deleteClient,
      upsertPayroll,
      deletePayroll,
      updateSettings,
      resetAll,
    }),
    [
      state,
      upsertNurse,
      deleteNurse,
      upsertStaff,
      deleteStaff,
      upsertClient,
      deleteClient,
      upsertPayroll,
      deletePayroll,
      updateSettings,
      resetAll,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider");
  }
  return context;
};

export const useData = () => useDataContext();
