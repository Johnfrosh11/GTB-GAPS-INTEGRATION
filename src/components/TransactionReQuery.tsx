import React, { useState } from 'react';
import { GAPSClient } from '../lib/gaps/client';
import { Search, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reQuerySchema } from '../lib/gaps/schemas';

interface TransactionReQueryProps {
  client: GAPSClient;
}

type ReQueryFormData = {
  reference: string;
};

interface TransactionStatus {
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message: string;
  details?: {
    amount?: string;
    date?: string;
    recipient?: string;
  };
}

export function TransactionReQuery({ client }: TransactionReQueryProps) {
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReQueryFormData>({
    resolver: zodResolver(reQuerySchema),
  });

  const onSubmit = async (data: ReQueryFormData) => {
    setLoading(true);
    try {
      // For demo purposes, always return success
      setTransactionStatus({
        status: 'SUCCESS',
        message: 'Transaction completed successfully',
        details: {
          date: new Date().toISOString().split('T')[0],
          recipient: data.reference.startsWith('BULK-') ? 'Multiple Recipients' : 'Single Recipient',
          amount: '₦250,000.00'
        }
      });
    } catch (error) {
      setTransactionStatus({
        status: 'FAILED',
        message: 'Failed to retrieve transaction status. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction Status Check</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Reference
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="reference"
              {...register('reference')}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter transaction reference"
            />
          </div>
          {errors.reference && (
            <p className="mt-1 text-sm text-red-600">{errors.reference.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Checking...'
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Check Status
            </>
          )}
        </button>
      </form>

      {transactionStatus && (
        <div className="mt-6">
          <div className={`p-4 rounded-lg ${
            transactionStatus.status === 'SUCCESS' ? 'bg-green-50' :
            transactionStatus.status === 'PENDING' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex items-start">
              {transactionStatus.status === 'SUCCESS' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
              ) : transactionStatus.status === 'PENDING' ? (
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div className="ml-3 w-full">
                <h3 className={`text-sm font-medium ${
                  transactionStatus.status === 'SUCCESS' ? 'text-green-800' :
                  transactionStatus.status === 'PENDING' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  Transaction Status: {transactionStatus.status}
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{transactionStatus.message}</p>
                  {transactionStatus.details && (
                    <dl className="mt-3 space-y-1">
                      {transactionStatus.details.amount && (
                        <div className="flex">
                          <dt className="w-24 flex-shrink-0 text-gray-500">Amount:</dt>
                          <dd>{transactionStatus.details.amount}</dd>
                        </div>
                      )}
                      {transactionStatus.details.date && (
                        <div className="flex">
                          <dt className="w-24 flex-shrink-0 text-gray-500">Date:</dt>
                          <dd>{transactionStatus.details.date}</dd>
                        </div>
                      )}
                      {transactionStatus.details.recipient && (
                        <div className="flex">
                          <dt className="w-24 flex-shrink-0 text-gray-500">Recipient:</dt>
                          <dd>{transactionStatus.details.recipient}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}