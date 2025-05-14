import { generateHash } from '../utils';
import type { 
  AccountBalanceRequest, 
  AccountValidationRequest,
  BulkTransferRequest,
  GAPSResponse,
  SingleTransferRequest,
  TransactionDetails,
  TransactionReQueryRequest 
} from './types';

export class GAPSClient {
  private isTest: boolean;
  private accessCode: string;
  private username: string;
  private password: string;

  constructor(
    accessCode: string,
    username: string,
    password: string,
    isTest: boolean = true
  ) {
    this.isTest = isTest;
    this.accessCode = accessCode;
    this.username = username;
    this.password = password;
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<GAPSResponse> {
    try {
      const proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gaps-proxy`;
      
      console.log('Making request to proxy:', proxyUrl);
      console.log('Request payload:', {
        endpoint,
        data,
        isTest: this.isTest,
      });

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          endpoint,
          data,
          isTest: this.isTest,
        }),
      });

      const responseText = await response.text();
      console.log('Proxy response:', responseText);

      if (!response.ok) {
        let errorDetail;
        try {
          errorDetail = JSON.parse(responseText);
        } catch {
          errorDetail = responseText;
        }
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetail)}`);
      }

      return this.parseResponse(responseText);
    } catch (error) {
      console.error('GAPS request failed:', error);
      throw new Error(`GAPS request failed: ${error.message}`);
    }
  }

  private parseResponse(xmlResponse: string): GAPSResponse {
    console.log('Parsing XML response:', xmlResponse);
    
    // Parse reference from response if available
    const referenceMatch = xmlResponse.match(/<Reference>(.*?)<\/Reference>/);
    const codeMatch = xmlResponse.match(/<Code>(\d+)<\/Code>/);
    const messageMatch = xmlResponse.match(/<Message>(.*?)<\/Message>/);

    const response = {
      code: codeMatch?.[1] || '1008', // Default to system error
      message: messageMatch?.[1] || 'Failed to parse response',
      reference: referenceMatch?.[1], // Add reference if present
    };

    console.log('Parsed response:', response);
    return response;
  }

  private generateTransactionXML(transactions: TransactionDetails[]): string {
    return transactions
      .map(
        (t) => `
        <transaction>
          <amount>${t.amount}</amount>
          <paymentdate>${t.paymentdate}</paymentdate>
          <reference>${t.reference}</reference>
          <remarks>${t.remarks}</remarks>
          <vendorcode>${t.vendorcode}</vendorcode>
          <vendorname>${t.vendorname}</vendorname>
          <vendoracctnumber>${t.vendoracctnumber}</vendoracctnumber>
          <vendorbankcode>${t.vendorbankcode}</vendorbankcode>
        </transaction>`
      )
      .join('');
  }

  async reQueryTransaction(reference: string): Promise<GAPSResponse> {
    const params: TransactionReQueryRequest = {
      reference,
      accesscode: this.accessCode,
      username: this.username,
      password: this.password,
      hash: generateHash({
        reference,
        accesscode: this.accessCode,
        username: this.username,
        password: this.password,
      }),
    };

    const xmlRequest = `
      <TransactionReQueryRequest>
        <reference>${params.reference}</reference>
        <accesscode>${params.accesscode}</accesscode>
        <username>${params.username}</username>
        <password>${params.password}</password>
        <hash>${params.hash}</hash>
      </TransactionReQueryRequest>
    `;

    return this.makeRequest('TransactionReQuery', xmlRequest);
  }

  async bulkTransfer(transactions: TransactionDetails[]): Promise<GAPSResponse> {
    const transdetails = `<transactions>${this.generateTransactionXML(transactions)}</transactions>`;
    
    const params: BulkTransferRequest = {
      transdetails,
      accesscode: this.accessCode,
      username: this.username,
      password: this.password,
      hash: generateHash({
        transdetails,
        accesscode: this.accessCode,
        username: this.username,
        password: this.password,
      }),
    };

    const xmlRequest = `
      <BulkTransferRequest>
        <transdetails>${params.transdetails}</transdetails>
        <accesscode>${params.accesscode}</accesscode>
        <username>${params.username}</username>
        <password>${params.password}</password>
        <hash>${params.hash}</hash>
      </BulkTransferRequest>
    `;

    return this.makeRequest('BulkTransfers', xmlRequest);
  }

  async singleTransfer(
    transaction: TransactionDetails,
    customerAcctNumber?: string
  ): Promise<GAPSResponse> {
    const transdetails = `<transactions>${this.generateTransactionXML([transaction])}</transactions>`;
    
    const params: SingleTransferRequest = {
      transdetails,
      accesscode: this.accessCode,
      username: this.username,
      password: this.password,
      customeracctnumber: customerAcctNumber,
      hash: generateHash({
        transdetails,
        accesscode: this.accessCode,
        username: this.username,
        password: this.password,
        ...(customerAcctNumber ? { customeracctnumber: customerAcctNumber } : {}),
      }),
    };

    const xmlRequest = `
      <SingleTransferRequest>
        <transdetails>${params.transdetails}</transdetails>
        <accesscode>${params.accesscode}</accesscode>
        <username>${params.username}</username>
        <password>${params.password}</password>
        ${customerAcctNumber ? `<customeracctnumber>${customerAcctNumber}</customeracctnumber>` : ''}
        <hash>${params.hash}</hash>
      </SingleTransferRequest>
    `;

    return this.makeRequest('SingleTransfers', xmlRequest);
  }

  async validateAccount(accountNumber: string): Promise<GAPSResponse> {
    const params: AccountValidationRequest = {
      customerid: this.accessCode,
      username: this.username,
      password: this.password,
      accountnumber: accountNumber,
      hash: generateHash({
        customerid: this.accessCode,
        username: this.username,
        password: this.password,
        accountnumber: accountNumber,
      }),
    };

    const xmlRequest = `
      <GetAccountInGTBRequest>
        <customerid>${params.customerid}</customerid>
        <username>${params.username}</username>
        <password>${params.password}</password>
        <accountnumber>${params.accountnumber}</accountnumber>
        <hash>${params.hash}</hash>
      </GetAccountInGTBRequest>
    `;

    return this.makeRequest('GetAccountInGTB', xmlRequest);
  }

  async getAccountBalance(accountNumber: string): Promise<GAPSResponse> {
    const params: AccountBalanceRequest = {
      customerid: this.accessCode,
      username: this.username,
      password: this.password,
      accountnumber: accountNumber,
      hash: generateHash({
        customerid: this.accessCode,
        username: this.username,
        password: this.password,
        accountnumber: accountNumber,
      }),
    };

    const xmlRequest = `
      <AccountBalanceRetrievalRequest>
        <customerid>${params.customerid}</customerid>
        <username>${params.username}</username>
        <password>${params.password}</password>
        <accountnumber>${params.accountnumber}</accountnumber>
        <hash>${params.hash}</hash>
      </AccountBalanceRetrievalRequest>
    `;

    return this.makeRequest('AccountBalanceRetrieval', xmlRequest);
  }
}