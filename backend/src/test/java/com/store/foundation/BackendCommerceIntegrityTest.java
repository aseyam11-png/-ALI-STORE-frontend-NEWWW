package com.store.foundation;

import com.store.common.exception.BusinessException;
import com.store.fulfillment.entity.FulfillmentTask;
import com.store.fulfillment.entity.FulfillmentTaskStatus;
import com.store.fulfillment.repository.FulfillmentTaskRepository;
import com.store.fulfillment.dto.SupplierFulfillmentRequest;
import com.store.fulfillment.dto.SupplierFulfillmentResponse;
import com.store.fulfillment.service.FulfillmentService;
import com.store.fulfillment.service.FulfillmentTaskProcessor;
import com.store.fulfillment.service.SupplierFulfillmentClient;
import com.store.inventory.entity.Inventory;
import com.store.inventory.enums.InventorySource;
import com.store.inventory.enums.PublicAvailability;
import com.store.inventory.repository.InventoryRepository;
import com.store.inventory.service.InventoryService;
import com.store.order.entity.Order;
import com.store.order.entity.OrderItem;
import com.store.order.entity.OrderStatus;
import com.store.order.repository.OrderRepository;
import com.store.product.entity.Product;
import com.store.product.enums.ProductStatus;
import com.store.product.repository.ProductRepository;
import com.store.product.service.ProductService;
import com.store.category.entity.Category;
import com.store.category.repository.CategoryRepository;
import com.store.shipping.entity.Shipment;
import com.store.shipping.entity.ShipmentStatus;
import com.store.shipping.repository.ShipmentRepository;
import com.store.shipping.service.ShipmentService;
import com.store.supplier.entity.Supplier;
import com.store.supplier.repository.SupplierRepository;
import com.store.supplier.service.SupplierService;
import com.store.user.entity.Role;
import com.store.user.entity.User;
import com.store.user.repository.RoleRepository;
import com.store.user.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BackendCommerceIntegrityTest {

    @Autowired private InventoryService inventoryService;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private SupplierService supplierService;
    @Autowired private ProductService productService;
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private FulfillmentTaskRepository taskRepository;
    @Autowired private FulfillmentTaskProcessor fulfillmentTaskProcessor;
    @Autowired private FulfillmentService fulfillmentService;
    @MockBean private SupplierFulfillmentClient supplierFulfillmentClient;
    @Autowired private ShipmentService shipmentService;

    @Test
    void supplierStockSync_ignoresOlderSnapshot() {
        Product product = product("SYNC-STALE", "https://supplier.example");
        LocalDateTime newest = LocalDateTime.now().minusMinutes(2);

        Inventory inventory = inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(10)
                .reservedQuantity(0)
                .lowStockThreshold(5)
                .source(InventorySource.SUPPLIER_SYNC)
                .lastSyncedAt(newest)
                .build());

        inventoryService.syncSupplierStock(product.getId(), 2, newest.minusMinutes(5));

        Inventory persisted = inventoryRepository.findById(inventory.getId()).orElseThrow();
        Assertions.assertEquals(10, persisted.getQuantity());
        Assertions.assertEquals(newest, persisted.getLastSyncedAt());
    }

    @Test
    void supplierStockSync_allowsSupplierQuantityBelowReservations_withoutFalsifyingAvailability() {
        Product product = product("SYNC-CONFLICT", "https://supplier.example");

        Inventory inventory = inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(10)
                .reservedQuantity(2)
                .lowStockThreshold(5)
                .source(InventorySource.SUPPLIER_SYNC)
                .lastSyncedAt(LocalDateTime.now().minusMinutes(1))
                .build());

        var response = inventoryService.syncSupplierStock(
                product.getId(), 0, LocalDateTime.now());

        Assertions.assertEquals(0, response.getQuantity());
        Assertions.assertEquals(2, response.getReservedQuantity());
        Assertions.assertEquals(0, response.getAvailableQuantity());
        Assertions.assertEquals(PublicAvailability.OUT_OF_STOCK, response.getAvailability());

        inventoryService.commitReservedStock(product.getId(), 2);
        Inventory afterCommit = inventoryRepository.findByProductId(product.getId()).orElseThrow();
        Assertions.assertEquals(0, afterCommit.getQuantity());
        Assertions.assertEquals(0, afterCommit.getReservedQuantity());
    }

    @Test
    void multiSupplierOrder_sendsEachSupplierOnlyItsOwnItems() {
        Category category = categoryRepository.save(Category.builder()
                .name("Supplier Split")
                .slug("supplier-split")
                .active(true)
                .build());

        Supplier supplierA = supplierRepository.save(Supplier.builder()
                .externalCode("SPLIT-A")
                .name("Split Supplier A")
                .apiBaseUrl("https://supplier-a.example")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(true)
                .build());

        Supplier supplierB = supplierRepository.save(Supplier.builder()
                .externalCode("SPLIT-B")
                .name("Split Supplier B")
                .apiBaseUrl("https://supplier-b.example")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(true)
                .build());

        Product productA = productRepository.save(Product.builder()
                .name("Supplier A Product")
                .slug("supplier-a-product")
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku("SPLIT-PROD-A")
                .status(ProductStatus.ACTIVE)
                .category(category)
                .supplier(supplierA)
                .supplierSku("SKU-A")
                .supplierCost(new BigDecimal("10.00"))
                .build());

        Product productB = productRepository.save(Product.builder()
                .name("Supplier B Product")
                .slug("supplier-b-product")
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku("SPLIT-PROD-B")
                .status(ProductStatus.ACTIVE)
                .category(category)
                .supplier(supplierB)
                .supplierSku("SKU-B")
                .supplierCost(new BigDecimal("11.00"))
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(productA)
                .quantity(5)
                .reservedQuantity(1)
                .lowStockThreshold(1)
                .source(InventorySource.MANUAL)
                .lastSyncedAt(LocalDateTime.now())
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(productB)
                .quantity(5)
                .reservedQuantity(1)
                .lowStockThreshold(1)
                .source(InventorySource.MANUAL)
                .lastSyncedAt(LocalDateTime.now())
                .build());

        Order order = orderRepository.save(Order.builder()
                .user(testUser())
                .status(OrderStatus.PROCESSING)
                .totalAmount(new BigDecimal("50.00"))
                .currency("USD")
                .shippingAddress("1 Main St")
                .reservationExpiresAt(LocalDateTime.now().plusMinutes(30))
                .build());

        order.getItems().add(OrderItem.builder()
                .order(order)
                .product(productA)
                .supplier(supplierA)
                .supplierSku("SKU-A")
                .supplierUnitCost(new BigDecimal("10.00"))
                .quantity(1)
                .unitPrice(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("25.00"))
                .build());

        order.getItems().add(OrderItem.builder()
                .order(order)
                .product(productB)
                .supplier(supplierB)
                .supplierSku("SKU-B")
                .supplierUnitCost(new BigDecimal("11.00"))
                .quantity(1)
                .unitPrice(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("25.00"))
                .build());

        orderRepository.save(order);
        fulfillmentService.enqueueForOrder(order.getId());

        List<FulfillmentTask> tasks = taskRepository.findByShipmentOrderId(order.getId());
        Assertions.assertEquals(2, tasks.size(), "A multi-supplier order must create one fulfillment task per supplier");

        when(supplierFulfillmentClient.submit(any(), any()))
                .thenAnswer(invocation -> {
                    SupplierFulfillmentRequest request = invocation.getArgument(1);
                    SupplierFulfillmentResponse response = new SupplierFulfillmentResponse();
                    response.setAccepted(true);
                    response.setSupplierOrderId("EXT-" + request.getShipmentId());
                    return response;
                });

        tasks.forEach(task -> fulfillmentTaskProcessor.processTask(task.getId()));

        var supplierCaptor = org.mockito.ArgumentCaptor.forClass(com.store.supplier.entity.Supplier.class);
        var requestCaptor = org.mockito.ArgumentCaptor.forClass(SupplierFulfillmentRequest.class);
        verify(supplierFulfillmentClient, org.mockito.Mockito.times(2))
                .submit(supplierCaptor.capture(), requestCaptor.capture());

        Map<String, String> expectedSkuBySupplier = Map.of(
                "SPLIT-A", "SKU-A",
                "SPLIT-B", "SKU-B");

        for (int i = 0; i < requestCaptor.getAllValues().size(); i++) {
            SupplierFulfillmentRequest request = requestCaptor.getAllValues().get(i);
            String supplierCode = supplierCaptor.getAllValues().get(i).getExternalCode();

            Assertions.assertEquals(supplierCode, request.getSupplierCode());
            Assertions.assertEquals(1, request.getItems().size());
            Assertions.assertEquals(expectedSkuBySupplier.get(supplierCode),
                    request.getItems().get(0).getSupplierSku());

            Shipment shipment = shipmentRepository.findById(request.getShipmentId()).orElseThrow();
            Assertions.assertEquals(supplierCode, shipment.getSupplier().getExternalCode());
            Assertions.assertEquals(ShipmentStatus.PROCESSING, shipment.getStatus());
        }
    }

    @Test
    void localFulfillmentIneligibility_cancelsShipment_andReleasesReservation() {
        Supplier supplier = supplierRepository.save(Supplier.builder()
                .externalCode("DISABLED-SUP")
                .name("Disabled Supplier")
                .apiBaseUrl("https://supplier.example")
                .fulfillmentEnabled(false)
                .inventorySyncEnabled(false)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Fulfillment Test")
                .slug("fulfillment-test")
                .active(true)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Fulfillment Test Product")
                .slug("fulfillment-test-product")
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku("FUL-FAIL-1")
                .status(ProductStatus.ACTIVE)
                .category(category)
                .supplier(supplier)
                .supplierSku("SUP-FUL-FAIL-1")
                .supplierCost(new BigDecimal("10.00"))
                .build());

        inventoryRepository.save(Inventory.builder()
                .product(product)
                .quantity(5)
                .reservedQuantity(2)
                .lowStockThreshold(5)
                .source(InventorySource.MANUAL)
                .lastSyncedAt(LocalDateTime.now())
                .build());

        Order order = orderRepository.save(Order.builder()
                .user(testUser())
                .status(OrderStatus.PROCESSING)
                .totalAmount(new BigDecimal("50.00"))
                .currency("USD")
                .shippingAddress("1 Main St")
                .reservationExpiresAt(LocalDateTime.now().plusMinutes(30))
                .build());

        OrderItem item = OrderItem.builder()
                .order(order)
                .product(product)
                .supplier(supplier)
                .supplierSku("SUP-FUL-FAIL-1")
                .supplierUnitCost(new BigDecimal("10.00"))
                .quantity(2)
                .unitPrice(new BigDecimal("25.00"))
                .subtotal(new BigDecimal("50.00"))
                .build();
        order.getItems().add(item);
        orderRepository.save(order);

        Shipment shipment = shipmentRepository.save(Shipment.builder()
                .orderId(order.getId())
                .supplier(supplier)
                .status(ShipmentStatus.PENDING)
                .shippingAddressSnapshot(order.getShippingAddress())
                .build());

        FulfillmentTask task = taskRepository.save(FulfillmentTask.builder()
                .shipment(shipment)
                .status(FulfillmentTaskStatus.PENDING)
                .attempts(0)
                .nextAttemptAt(LocalDateTime.now())
                .build());

        fulfillmentTaskProcessor.processTask(task.getId());

        Assertions.assertEquals(
                FulfillmentTaskStatus.CANCELLED,
                taskRepository.findById(task.getId()).orElseThrow().getStatus());
        Assertions.assertEquals(
                ShipmentStatus.CANCELLED,
                shipmentRepository.findById(shipment.getId()).orElseThrow().getStatus());
        Assertions.assertEquals(
                OrderStatus.CANCELLED,
                orderRepository.findById(order.getId()).orElseThrow().getStatus());
        Assertions.assertEquals(
                0,
                inventoryRepository.findByProductId(product.getId()).orElseThrow().getReservedQuantity());
    }

    @Test
    void multiSupplierOrder_entersExplicitFulfillmentFailure_insteadOfStuckShipped() {
        Order order = orderRepository.save(Order.builder()
                .user(testUser())
                .status(OrderStatus.PROCESSING)
                .totalAmount(new BigDecimal("50.00"))
                .currency("USD")
                .shippingAddress("1 Main St")
                .reservationExpiresAt(LocalDateTime.now().plusMinutes(30))
                .build());

        Supplier failedSupplier = supplierRepository.save(Supplier.builder()
                .externalCode("MULTI-FAIL")
                .name("Failed Supplier")
                .fulfillmentEnabled(false)
                .inventorySyncEnabled(false)
                .build());

        Supplier activeSupplier = supplierRepository.save(Supplier.builder()
                .externalCode("MULTI-OK")
                .name("Active Supplier")
                .apiBaseUrl("https://supplier.example")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(true)
                .build());

        shipmentRepository.save(Shipment.builder()
                .orderId(order.getId())
                .supplier(failedSupplier)
                .status(ShipmentStatus.CANCELLED)
                .shippingAddressSnapshot(order.getShippingAddress())
                .build());

        shipmentRepository.save(Shipment.builder()
                .orderId(order.getId())
                .supplier(activeSupplier)
                .status(ShipmentStatus.PROCESSING)
                .supplierOrderId("SUP-OK-1")
                .shippingAddressSnapshot(order.getShippingAddress())
                .build());

        shipmentService.synchronizeOrderStatus(order.getId());

        Assertions.assertEquals(
                OrderStatus.FULFILLMENT_FAILED,
                orderRepository.findById(order.getId()).orElseThrow().getStatus());
    }

    @Test
    void shipmentCannotAdvance_withoutConfirmedSupplierAcceptance() {
        Order order = orderRepository.save(Order.builder()
                .user(testUser())
                .status(OrderStatus.PROCESSING)
                .totalAmount(new BigDecimal("25.00"))
                .currency("USD")
                .shippingAddress("1 Main St")
                .reservationExpiresAt(LocalDateTime.now().plusMinutes(30))
                .build());

        Supplier supplier = supplierRepository.save(Supplier.builder()
                .externalCode("SHIP-GATE")
                .name("Ship Gate Supplier")
                .apiBaseUrl("https://supplier.example")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(true)
                .build());

        Shipment shipment = shipmentRepository.save(Shipment.builder()
                .orderId(order.getId())
                .supplier(supplier)
                .status(ShipmentStatus.PROCESSING)
                .shippingAddressSnapshot(order.getShippingAddress())
                .build());
        final Long shipmentId = shipment.getId();

        FulfillmentTask task = taskRepository.save(FulfillmentTask.builder()
                .shipment(shipment)
                .status(FulfillmentTaskStatus.PROCESSING)
                .attempts(1)
                .nextAttemptAt(LocalDateTime.now())
                .build());

        Assertions.assertThrows(
                BusinessException.class,
                () -> shipmentService.updateStatus(shipmentId, ShipmentStatus.SHIPPED));

        shipment = shipmentRepository.findById(shipmentId).orElseThrow();
        shipment.setSupplierOrderId("SUP-ACCEPTED-1");
        shipmentRepository.save(shipment);

        Assertions.assertThrows(
                BusinessException.class,
                () -> shipmentService.updateStatus(shipmentId, ShipmentStatus.SHIPPED));

        task = taskRepository.findById(task.getId()).orElseThrow();
        task.setStatus(FulfillmentTaskStatus.SUCCEEDED);
        taskRepository.save(task);

        Assertions.assertDoesNotThrow(
                () -> shipmentService.updateStatus(shipmentId, ShipmentStatus.SHIPPED));
    }

    @Test
    void supplierCreate_rejectsEnabledFulfillment_withoutHttpsEndpoint() {
        var request = new com.store.supplier.dto.SupplierRequest();
        request.setExternalCode("BAD-SUP");
        request.setName("Bad Supplier");
        request.setFulfillmentEnabled(true);

        Assertions.assertThrows(
                BusinessException.class,
                () -> supplierService.create(request));
    }

    @Test
    void activeProduct_requiresSupplierEndpoint_andCredentialConfiguration() {
        Category category = categoryRepository.save(Category.builder()
                .name("Publish Test")
                .slug("publish-test")
                .active(true)
                .build());

        Supplier supplier = supplierRepository.save(Supplier.builder()
                .externalCode("PUBLISH-SUP")
                .name("Publish Supplier")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(false)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Publish Product")
                .slug("publish-product")
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku("PUBLISH-1")
                .status(ProductStatus.DRAFT)
                .category(category)
                .supplier(supplier)
                .supplierSku("SUP-PUBLISH-1")
                .supplierCost(new BigDecimal("10.00"))
                .build());

        Assertions.assertThrows(
                BusinessException.class,
                () -> productService.updateProduct(product.getId(),
                        statusRequest(ProductStatus.ACTIVE)));
    }

    @Test
    void activeProduct_isAllowed_whenSupplierEndpoint_andCredentialAreConfigured() {
        Category category = categoryRepository.save(Category.builder()
                .name("Configured Publish Test")
                .slug("configured-publish-test")
                .active(true)
                .build());

        Supplier supplier = supplierRepository.save(Supplier.builder()
                .externalCode("PUBLISH-READY")
                .name("Ready Supplier")
                .apiBaseUrl("https://ready-supplier.example")
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(false)
                .build());

        Product product = productRepository.save(Product.builder()
                .name("Ready Publish Product")
                .slug("ready-publish-product")
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku("PUBLISH-READY-1")
                .status(ProductStatus.DRAFT)
                .category(category)
                .supplier(supplier)
                .supplierSku("SUP-PUBLISH-READY-1")
                .supplierCost(new BigDecimal("10.00"))
                .build());

        Assertions.assertDoesNotThrow(
                () -> productService.updateProduct(product.getId(),
                        statusRequest(ProductStatus.ACTIVE)));

        Assertions.assertEquals(
                ProductStatus.ACTIVE,
                productRepository.findById(product.getId()).orElseThrow().getStatus());
    }

    private User testUser() {
        Role role = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .name("ROLE_USER")
                                .description("Standard customer role")
                                .build()));

        return userRepository.save(User.builder()
                .firstName("Integrity")
                .lastName("Test")
                .email("integrity-" + System.nanoTime() + "@example.com")
                .password("test-password")
                .isEnabled(true)
                .role(role)
                .build());
    }

    private Product product(String sku, String apiBaseUrl) {
        Category category = categoryRepository.save(Category.builder()
                .name("Inventory " + sku)
                .slug("inventory-" + sku.toLowerCase())
                .active(true)
                .build());
        Supplier supplier = supplierRepository.save(Supplier.builder()
                .externalCode("SUP-" + sku)
                .name("Supplier " + sku)
                .apiBaseUrl(apiBaseUrl)
                .fulfillmentEnabled(true)
                .inventorySyncEnabled(true)
                .build());
        return productRepository.save(Product.builder()
                .name("Product " + sku)
                .slug("product-" + sku.toLowerCase())
                .price(new BigDecimal("25.00"))
                .currency("USD")
                .sku(sku)
                .status(ProductStatus.DRAFT)
                .category(category)
                .supplier(supplier)
                .supplierSku("SUP-" + sku)
                .supplierCost(new BigDecimal("10.00"))
                .build());
    }

    private com.store.product.dto.ProductUpdateRequest statusRequest(ProductStatus status) {
        var request = new com.store.product.dto.ProductUpdateRequest();
        request.setStatus(status);
        return request;
    }
}
