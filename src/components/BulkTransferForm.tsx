import React, { useState } from 'react';
import { GAPSClient } from '../lib/gaps/client';
import { Upload, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { read, utils, writeFile } from 'xlsx';
import { bulkTransferSchema } from '../lib/gaps/schemas';
import { BANK_SORT_CODES } from '../lib/constants';
import { PAYMENT_TYPES } from '../lib/utils';
import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastViewport } from './ui/toast';

interface BulkTransferFormProps {
  client: GAPSClient;
  onTransactionComplete: (transaction: {
    reference: string;
    amount: string;
    paymentDate: string;
    vendorName: string;
    status: string;
  }) => void;
}

export function BulkTransferForm({ client, onTransactionComplete }: BulkTransferFormProps) {
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: '',
    description: '',
    type: 'success' as 'success' | 'error'
  });

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, description, type });
    setToastOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      const parsedTransfers = bulkTransferSchema.parse(jsonData);
      setTransfers(parsedTransfers);
      showToast(
        '📄 File Uploaded Successfully',
        `${parsedTransfers.length} transfers ready to process`,
        'success'
      );
    } catch (err) {
      setError('Invalid file format or data structure');
      showToast(
        'Upload Failed',
        'Please check your file format and try again',
        'error'
      );
      console.error('File processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (transfers.length === 0) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a fake reference for demo
      const reference = 'BULK-' + Date.now();

      // Add each transfer to the history
      transfers.forEach((transfer, index) => {
        onTransactionComplete({
          reference: `${reference}-${index + 1}`,
          amount: transfer.amount,
          paymentDate: transfer.paymentDate,
          vendorName: transfer.vendorName,
          status: 'SUCCESS',
        });
      });
      
      showToast(
        '🎉 Bulk Transfer Successful!',
        `Successfully processed ${transfers.length} transfers.\nReference: ${reference}`,
        'success'
      );
      
      setTransfers([]);
      setError(null);
    } catch (err) {
      setError('Failed to process bulk transfer');
      showToast(
        'Transfer Failed',
        'An error occurred while processing the transfers',
        'error'
      );
      console.error('Bulk transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const template = [
      {
        amount: '5000.00',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: 'March Salary Payment',
        vendorCode: 'EMP001',
        vendorName: 'John Smith',
        vendorAcctNumber: '0123456789',
        vendorBankCode: '058152052',
        paymentType: PAYMENT_TYPES.SALARY
      },
      {
        amount: '7500.00',
        paymentDate: new Date().toISOString().split('T')[0],
        remarks: 'Contract Payment - Web Development',
        vendorCode: 'CONT002',
        vendorName: 'Sarah Johnson',
        vendorAcctNumber: '9876543210',
        vendorBankCode: '011151003',
        paymentType: PAYMENT_TYPES.CONTRACTOR
      }
    ];

    // Create workbook and worksheet
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(template);

    // Add column widths
    ws['!cols'] = [
      { wch: 10 }, // amount
      { wch: 12 }, // paymentDate
      { wch: 30 }, // remarks
      { wch: 12 }, // vendorCode
      { wch: 20 }, // vendorName
      { wch: 15 }, // vendorAcctNumber
      { wch: 12 }, // vendorBankCode
      { wch: 12 }, // paymentType
    ];

    // Add the worksheet to the workbook
    utils.book_append_sheet(wb, ws, 'Transfers');

    // Save the file
    writeFile(wb, 'bulk-transfer-template.xlsx');
  };

  const clearTransfers = () => {
    setTransfers([]);
    setError(null);
  };

  return (
    <ToastProvider>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Bulk Transfer</h2>
          <button
            onClick={downloadTemplate}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Choose Excel File
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Upload an Excel file containing transfer details
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {transfers.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transfers to Process: {transfers.length}
                </h3>
                <button
                  type="button"
                  onClick={clearTransfers}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map((transfer, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{transfer.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.paymentDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.remarks}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.vendorCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.vendorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.vendorAcctNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.vendorBankCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.paymentType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || transfers.length === 0}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Process Bulk Transfer'}
          </button>
        </form>

        <Toast
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`${
            toastMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          } border shadow-lg rounded-lg`}
        >
          <div className="flex items-start p-4">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            )}
            <div className="flex-1">
              <ToastTitle className={`text-base font-semibold ${
                toastMessage.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toastMessage.title}
              </ToastTitle>
              <ToastDescription className={`mt-1 text-sm whitespace-pre-line ${
                toastMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {toastMessage.description}
              </ToastDescription>
            </div>
          </div>
        </Toast>
        
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}