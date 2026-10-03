package com.store.order.entity;

import com.store.common.entity.BaseEntity;
import com.store.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", uniqueConstraints = {
        @UniqueConstraint(name = "uk_orders_user_idempotency_key", columnNames = {"user_id", "idempotency_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(nullable = false)
    private String shippingAddress;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "reservation_expires_at", nullable = false)
    @Builder.Default
    private java.time.LocalDateTime reservationExpiresAt = java.time.LocalDateTime.now().plusMinutes(30);

    @BatchSize(size = 50)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}