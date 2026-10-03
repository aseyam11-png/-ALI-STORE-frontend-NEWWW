package com.store.inventory.service;

import com.store.common.exception.BusinessException;
import com.store.common.exception.ResourceNotFoundException;
import com.store.inventory.dto.InventoryResponse;
import com.store.inventory.dto.SupplierInventoryItem;
import com.store.inventory.dto.SupplierInventoryResponse;
import com.store.inventory.dto.SupplierInventorySyncReport;
import com.store.product.entity.Product;
import com.store.product.enums.ProductStatus;
import com.store.product.repository.ProductRepository;
import com.store.supplier.entity.Supplier;
import com.store.supplier.entity.SupplierStatus;
import com.store.supplier.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierInventorySyncService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final SupplierInventoryClient supplierInventoryClient;
    private final PlatformTransactionManager transactionManager;

    public SupplierInventorySyncReport syncSupplier(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        if (supplier.getStatus() != SupplierStatus.ACTIVE) {
            throw new BusinessException("Supplier is not active");
        }
        if (!Boolean.TRUE.equals(supplier.getInventorySyncEnabled())) {
            throw new BusinessException("Supplier inventory synchronization is disabled");
        }

        // Never hold database locks while waiting on a supplier network call.
        SupplierInventoryResponse payload = supplierInventoryClient.pull(supplier);
        LocalDateTime receivedAt = LocalDateTime.now();

        return new TransactionTemplate(transactionManager)
                .execute(status -> applyPayload(supplierId, payload, receivedAt));
    }

    private SupplierInventorySyncReport applyPayload(
            Long supplierId,
            SupplierInventoryResponse payload,
            LocalDateTime receivedAt) {

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        List<String> errors = new ArrayList<>();
        int received = payload == null || payload.getItems() == null ? 0 : payload.getItems().size();
        int matched = 0;
        int updated = 0;
        int rejected = 0;

        if (payload != null && payload.getItems() != null) {
            for (SupplierInventoryItem item : payload.getItems()) {
                if (item == null || item.getSupplierSku() == null || item.getSupplierSku().isBlank()) {
                    rejected++;
                    errors.add("Rejected inventory item without supplierSku");
                    continue;
                }

                String supplierSku = item.getSupplierSku().trim();
                if (item.getQuantity() == null || item.getQuantity() < 0) {
                    rejected++;
                    errors.add("Rejected " + supplierSku + ": quantity must be >= 0");
                    continue;
                }

                Product product = productRepository.findFirstBySupplierIdAndSupplierSku(
                        supplier.getId(), supplierSku).orElse(null);
                if (product == null) {
                    continue;
                }

                matched++;
                LocalDateTime observedAt = item.getObservedAt() != null
                        ? item.getObservedAt()
                        : (item.getSyncedAt() != null ? item.getSyncedAt() : receivedAt);

                try {
                    InventoryResponse inventory = inventoryService.syncSupplierStock(
                            product.getId(), item.getQuantity(), observedAt);

                    // The inventory service is the freshness gate. A stale source
                    // snapshot must not update supplier cost either.
                    boolean snapshotApplied = observedAt.equals(inventory.getLastSyncedAt());
                    if (snapshotApplied && item.getUnitCost() != null) {
                        applySupplierCost(product, item.getUnitCost(), item.getCurrency());
                        productRepository.save(product);
                    }

                    updated++;
                } catch (BusinessException ex) {
                    rejected++;
                    errors.add("Rejected " + supplierSku + ": " + ex.getMessage());
                }
            }
        }

        return SupplierInventorySyncReport.builder()
                .supplierId(supplier.getId())
                .supplierCode(supplier.getExternalCode())
                .receivedItems(received)
                .matchedProducts(matched)
                .updatedProducts(updated)
                .rejectedItems(rejected)
                .syncedAt(receivedAt)
                .errors(List.copyOf(errors))
                .build();
    }

    private void applySupplierCost(Product product, BigDecimal unitCost, String currency) {
        if (unitCost.signum() <= 0) {
            throw new BusinessException("Supplier cost must be greater than zero for " + product.getSku());
        }

        if (currency != null && !currency.isBlank()
                && product.getCurrency() != null
                && !currency.equalsIgnoreCase(product.getCurrency())) {
            throw new BusinessException(
                    "Currency mismatch for supplier SKU " + product.getSupplierSku());
        }

        product.setSupplierCost(unitCost);

        if (product.getStatus() == ProductStatus.ACTIVE
                && product.getPrice() != null
                && product.getPrice().compareTo(unitCost) < 0) {
            product.setStatus(ProductStatus.DRAFT);
        }
    }
}