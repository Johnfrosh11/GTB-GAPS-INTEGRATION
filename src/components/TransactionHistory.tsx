import React from 'react';
import { format } from 'date-fns';
import { GAPSClient } from '../lib/gaps/client';

interface Transaction {
  reference: string;
  amount: string;
  paymentDate: string;
  vendorName: string;
  status: string;
}

interface TransactionHistoryProps {
  client: GAPSClient;
  transactions: Transaction[];
  onRequery: (reference: string) => void;
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction History</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.reference}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(transaction.paymentDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.vendorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}