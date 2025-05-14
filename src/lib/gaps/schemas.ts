import { z } from 'zod';
import { PAYMENT_TYPES } from '../utils';

export const transferSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  remarks: z.string().min(1, 'Remarks are required'),
  vendorCode: z.string().min(1, 'Vendor code is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  vendorAcctNumber: z.string().length(10, 'Account number must be 10 digits'),
  vendorBankCode: z.string().min(1, 'Bank code is required'),
  paymentType: z.enum(['45', '2081', '76', '79', 'B16', 'A49', 'J8', '64', '330', '86', '93', '102'] as [keyof typeof PAYMENT_TYPES, ...Array<keyof typeof PAYMENT_TYPES>]),
});

export const bulkTransferSchema = z.array(transferSchema);

export const reQuerySchema = z.object({
  reference: z.string().min(1, 'Transaction reference is required'),
});