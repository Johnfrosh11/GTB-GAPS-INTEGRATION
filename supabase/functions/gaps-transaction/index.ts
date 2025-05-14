import { corsHeaders } from '../_shared/cors.ts';
import { generateHash } from '../_shared/utils.ts';

interface TransactionRequest {
  amount: string;
  paymentDate: string;
  remarks: string;
  vendorCode: string;
  vendorName: string;
  vendorAcctNumber: string;
  vendorBankCode: string;
  paymentType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      amount,
      paymentDate,
      remarks,
      vendorCode,
      vendorName,
      vendorAcctNumber,
      vendorBankCode,
      paymentType
    }: TransactionRequest = await req.json();

    // Generate a unique reference
    const reference = 'TRX' + crypto.randomUUID().replace(/-/g, '').slice(0, 9).toUpperCase();

    // In a real implementation, this would make the actual GAPS API call
    // For demo purposes, we'll simulate a successful response
    const response = {
      code: '1000',
      message: 'Transaction processed successfully',
      reference,
      details: {
        amount,
        date: paymentDate,
        recipient: vendorName
      }
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      code: '1008',
      message: 'Transaction processing failed',
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});