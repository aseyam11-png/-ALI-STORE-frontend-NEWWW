package com.store.fulfillment.service;

import com.store.common.exception.BusinessException;
import com.store.order.entity.Order;
import com.store.order.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class SupplierOrderPartitioner {

    /**
     * Splits one customer order into supplier-scoped item groups.
     *
     * An order must be fully partitionable: silently dropping an item with no
     * supplier would create a fulfillment request that does not represent the
     * customer's complete order.
     */
    public Map<Long, List<OrderItem>> partition(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Order has no items to partition for supplier fulfillment");
        }

        Map<Long, List<OrderItem>> partitions = new LinkedHashMap<>();
        for (OrderItem item : order.getItems()) {
            if (item.getSupplier() == null || item.getSupplier().getId() == null) {
                throw new BusinessException(
                        "Every order item must have a supplier before fulfillment can be created");
            }

            partitions
                    .computeIfAbsent(item.getSupplier().getId(), ignored -> new ArrayList<>())
                    .add(item);
        }
        return partitions;
    }

    /**
     * Returns only the items owned by the supplier attached to a shipment.
     *
     * Returning a new list prevents callers from accidentally modifying the
     * order's item collection while preparing an external supplier payload.
     */
    public List<OrderItem> forSupplier(Order order, Long supplierId) {
        if (order == null || order.getItems() == null || supplierId == null) {
            return List.of();
        }

        return order.getItems().stream()
                .filter(item -> item.getSupplier() != null
                        && supplierId.equals(item.getSupplier().getId()))
                .toList();
    }
}
