import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const currencyFormatter = (value: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

export const formatDisplayDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB");

export const generateId = () => crypto.randomUUID();
