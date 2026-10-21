export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  proofUrl: string | null;
  status: PaymentStatus;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  rejectReason?: string | null;
  createdAt: string;
}

export interface ManualPaymentAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
  qrisUrl?: string;
  instructions: string[];
}
