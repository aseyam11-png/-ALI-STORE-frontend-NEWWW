package com.store.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SupplierInventoryItem {
    private String supplierSku;
    private Integer quantity;
    private LocalDateTime syncedAt;
    private LocalDateTime observedAt;
    private BigDecimal unitCost;
    private String currency;
}