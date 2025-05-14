import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SHA512 from 'crypto-js/sha512';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateHash(params: Record<string, string>): string {
  const concatenatedString = Object.values(params).join('');
  return SHA512(concatenatedString).toString();
}

export const BANK_CODES = {
  GTB: '058',
  // Add more banks as needed
} as const;

export const PAYMENT_TYPES = {
  SALARY: '45',
  VENDOR: '2081',
  BUSINESS_TRAVEL: '76',
  CONTRACT_SERVICES: '79',
  CONTRACTOR: 'B16',
  FUNDS_TRANSFER: 'A49',
  HOUSING_ALLOWANCE: 'J8',
  INSURANCE_PENSION: '64',
  LOAN_DISBURSEMENT: '330',
  MEDICAL: '86',
  TRAINING: '93',
  TRANSFER_BETWEEN_CUSTOMERS: '102'
} as const;