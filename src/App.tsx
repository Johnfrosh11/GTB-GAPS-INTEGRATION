import React, { useState } from 'react';
import { BankTransferForm } from './components/BankTransferForm';
import { BulkTransferForm } from './components/BulkTransferForm';
import { TransactionReQuery } from './components/TransactionReQuery';
import { TransactionHistory } from './components/TransactionHistory';
import { GAPSClient } from './lib/gaps/client';
import { Wallet, History } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

interface Transaction {
  reference: string;
  amount: string;
  paymentDate: string;
  vendorName: string;
  status: string;
}

// Initialize GAPS client with test credentials
const gapsClient = new GAPSClient(
  'TEST_ACCESS_CODE',
  'TEST_USERNAME',
  'TEST_PASSWORD',
  true
);

// Initial transaction history data
const initialTransactions: Transaction[] = [
  {
    reference: 'TRX123456789',
    amount: '250,000.00',
    paymentDate: '2024-03-15',
    vendorName: 'Tech Solutions Ltd',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX987654321',
    amount: '175,500.00',
    paymentDate: '2024-03-14',
    vendorName: 'Global Services Inc',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX456789123',
    amount: '89,750.00',
    paymentDate: '2024-03-14',
    vendorName: 'Digital Systems Co',
    status: 'FAILED'
  },
  {
    reference: 'TRX789123456',
    amount: '320,000.00',
    paymentDate: '2024-03-13',
    vendorName: 'Innovation Labs',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX654321987',
    amount: '145,800.00',
    paymentDate: '2024-03-13',
    vendorName: 'Creative Solutions',
    status: 'PENDING'
  },
  {
    reference: 'TRX321987654',
    amount: '275,900.00',
    paymentDate: '2024-03-12',
    vendorName: 'Enterprise Systems',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX147258369',
    amount: '92,500.00',
    paymentDate: '2024-03-12',
    vendorName: 'Data Analytics Pro',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX258369147',
    amount: '188,600.00',
    paymentDate: '2024-03-11',
    vendorName: 'Cloud Services Ltd',
    status: 'FAILED'
  },
  {
    reference: 'TRX369147258',
    amount: '435,000.00',
    paymentDate: '2024-03-11',
    vendorName: 'Security Solutions',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX741852963',
    amount: '167,300.00',
    paymentDate: '2024-03-10',
    vendorName: 'Network Systems Inc',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX852963741',
    amount: '298,400.00',
    paymentDate: '2024-03-10',
    vendorName: 'Software Corp',
    status: 'PENDING'
  },
  {
    reference: 'TRX963741852',
    amount: '144,700.00',
    paymentDate: '2024-03-09',
    vendorName: 'Tech Consulting',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX159357486',
    amount: '523,800.00',
    paymentDate: '2024-03-09',
    vendorName: 'Digital Marketing Pro',
    status: 'SUCCESS'
  },
  {
    reference: 'TRX357486159',
    amount: '187,900.00',
    paymentDate: '2024-03-08',
    vendorName: 'Web Solutions Ltd',
    status: 'FAILED'
  },
  {
    reference: 'TRX486159357',
    amount: '295,600.00',
    paymentDate: '2024-03-08',
    vendorName: 'Mobile Apps Inc',
    status: 'SUCCESS'
  }
];

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleTransactionComplete = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleRequery = async (reference: string) => {
    try {
      const response = await gapsClient.reQueryTransaction(reference);
      setTransactions((prev) =>
        prev.map((t) =>
          t.reference === reference
            ? { ...t, status: response.code === '1000' ? 'SUCCESS' : 'FAILED' }
            : t
        )
      );
    } catch (error) {
      console.error('Failed to requery transaction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              GAPS Integration
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs.Root defaultValue="single" className="space-y-6">
            <Tabs.List className="flex space-x-4 border-b border-gray-200">
              <Tabs.Trigger
                value="single"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                Single Transfer
              </Tabs.Trigger>
              <Tabs.Trigger
                value="bulk"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                Bulk Transfer
              </Tabs.Trigger>
              <Tabs.Trigger
                value="history"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </span>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="requery"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                Check Status
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="single">
              <BankTransferForm client={gapsClient} onTransactionComplete={handleTransactionComplete} />
            </Tabs.Content>
            <Tabs.Content value="bulk">
              <BulkTransferForm client={gapsClient} onTransactionComplete={handleTransactionComplete} />
            </Tabs.Content>
            <Tabs.Content value="history">
              <TransactionHistory 
                client={gapsClient}
                transactions={transactions}
                onRequery={handleRequery}
              />
            </Tabs.Content>
            <Tabs.Content value="requery">
              <TransactionReQuery client={gapsClient} />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </main>
    </div>
  );
}

export default App;