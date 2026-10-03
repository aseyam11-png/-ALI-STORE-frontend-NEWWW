package com.store.payment.controller;

import com.store.common.response.ApiResponse;
import com.store.payment.dto.PaymentResponse;
import com.store.payment.dto.RefundResponse;
import com.store.payment.service.PaymentReconciliationService;
import com.store.payment.service.PaymentService;
import com.store.payment.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentService paymentService;
    private final PaymentReconciliationService paymentReconciliationService;
    private final RefundService refundService;

    @PostMapping("/{paymentId}/reconcile")
    public ResponseEntity<ApiResponse<PaymentResponse>> reconcile(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentReconciliationService.reconcile(paymentId),
                "Payment reconciliation completed"));
    }

    @PostMapping("/{paymentId}/cod/collect")
    public ResponseEntity<ApiResponse<PaymentResponse>> collectCod(
            @PathVariable Long paymentId) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.confirmCodCollectionByPaymentId(paymentId),
                "COD collection confirmed"));
    }

    @PostMapping("/refunds/{refundId}/retry")
    public ResponseEntity<ApiResponse<RefundResponse>> retryRefund(
            @PathVariable Long refundId) {
        return ResponseEntity.ok(ApiResponse.success(
                refundService.retry(refundId),
                "Refund retry processed"));
    }
}
