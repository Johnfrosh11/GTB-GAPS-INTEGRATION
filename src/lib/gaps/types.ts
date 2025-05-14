export interface TransactionDetails {
  amount: string;
  paymentdate: string;
  reference: string;
  remarks: string;
  vendorcode: string;
  vendorname: string;
  vendoracctnumber: string;
  vendorbankcode: string;
}

export interface BulkTransferRequest {
  transdetails: string;
  accesscode: string;
  username: string;
  password: string;
  hash: string;
}

export interface SingleTransferRequest extends BulkTransferRequest {
  customeracctnumber?: string;
}

export interface AccountBalanceRequest {
  customerid: string;
  username: string;
  password: string;
  accountnumber: string;
  hash: string;
}

export interface AccountValidationRequest {
  customerid: string;
  username: string;
  password: string;
  accountnumber: string;
  hash: string;
}

export interface TransactionReQueryRequest {
  reference: string;
  accesscode: string;
  username: string;
  password: string;
  hash: string;
}

export interface GAPSResponse {
  code: string;
  message: string;
  reference?: string;
}