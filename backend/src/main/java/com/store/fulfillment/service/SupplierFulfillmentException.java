package com.store.fulfillment.service;

public class SupplierFulfillmentException extends RuntimeException {

    private final boolean retryable;

    public SupplierFulfillmentException(String message, boolean retryable) {
        super(message);
        this.retryable = retryable;
    }

    public SupplierFulfillmentException(String message, Throwable cause, boolean retryable) {
        super(message, cause);
        this.retryable = retryable;
    }

    public boolean isRetryable() {
        return retryable;
    }
}
