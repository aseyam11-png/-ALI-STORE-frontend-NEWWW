export type SettlementStatus =
  | "PENDING"
  | "AVAILABLE"
  | "PAID"
  | "ON_HOLD";

export interface Transaction {
  id: string;
  orderId: string;

  grossAmount: number;

  fulfillmentCost: number;

  processingFee: number;

  adjustmentAmount: number;

  netAmount: number;

  profitAmount: number;

  currency: string;

  status: SettlementStatus;

  createdAt: string;
  availableAt?: string;
  paidAt?: string;

  note?: string;
}

export interface FinanceSummary {
  grossSales: number;

  fulfillmentCosts: number;

  processingFees: number;

  adjustments: number;

  profit: number;

  pending: number;
  available: number;
  paid: number;

  netRevenue: number;
}
