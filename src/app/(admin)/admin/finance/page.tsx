"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, DollarSign, RefreshCcw, Wallet } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";
import { LocalizedPrice } from "@/components/localization/LocalizedPrice";
import { collectCashOnDelivery, reconcilePayment } from "@/features/admin/payments/services/admin-payment-api.service";
import { getAdminPayments, type AdminPayment } from "@/features/admin/finance/services/admin-finance-api.service";

type Payment = {
  id: number;
  orderId: number;
  amount: number;
  method: "CREDIT_CARD" | "PAYPAL" | "CASH_ON_DELIVERY";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REQUIRES_RECONCILIATION" | "REFUND_PENDING" | "REFUNDED";
  transactionId?: string | null;
  collectionStatus?: "NOT_REQUIRED" | "PENDING" | "COLLECTED";
  createdAt: string;
};