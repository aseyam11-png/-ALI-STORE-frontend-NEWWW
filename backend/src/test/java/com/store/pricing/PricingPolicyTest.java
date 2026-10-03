package com.store.pricing;

import com.store.category.entity.Category;
import com.store.category.repository.CategoryRepository;
import com.store.common.exception.BusinessException;
import com.store.pricing.dto.PricingRuleRequest;
import com.store.pricing.entity.PricingRuleScope;
import com.store.pricing.entity.PricingRuleType;
import com.store.pricing.repository.PricingRuleRepository;
import com.store.pricing.service.PricingService;
import com.store.product.entity.Product;
import com.store.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingPolicyTest {
    @Mock PricingRuleRepository rules;
    @Mock CategoryRepository categories;
    @Mock ProductRepository products;

    @Test
    void percentageMarkup_raisesSupplierCostWithoutGoingBelowCost() {
        PricingService service = new PricingService(rules, categories, products);
        Category category = Category.builder().name("Electronics").build();
        category.setId(10L);
        Product product = Product.builder().category(category).supplierCost(new BigDecimal("10.00"))
                .price(new BigDecimal("11.00")).build();
        product.setId(5L);

        var rule = com.store.pricing.entity.PricingRule.builder()
                .scope(PricingRuleScope.CATEGORY).type(PricingRuleType.PERCENTAGE_MARKUP)
                .value(new BigDecimal("20.00")).active(true).priority(1).category(category).build();
        when(products.findById(5L)).thenReturn(Optional.of(product));
        when(rules.findEffectiveRules(10L, 5L)).thenReturn(java.util.List.of(rule));
        when(products.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal price = service.repriceAndSave(5L);

        assertEquals(new BigDecimal("12.00"), price);
        assertEquals(new BigDecimal("12.00"), product.getPrice());
    }

    @Test
    void globalRuleCannotCarryCategoryOrProductTarget() {
        PricingService service = new PricingService(rules, categories, products);
        PricingRuleRequest request = new PricingRuleRequest();
        request.setScope(PricingRuleScope.GLOBAL);
        request.setType(PricingRuleType.FIXED_MARKUP);
        request.setValue(new BigDecimal("5"));
        request.setCategoryId(10L);

        assertThrows(com.store.common.exception.ConflictException.class,
                () -> service.createRule(request));
    }

    @Test
    void percentageMarkupAboveLimitIsRejected() {
        PricingService service = new PricingService(rules, categories, products);
        PricingRuleRequest request = new PricingRuleRequest();
        request.setScope(PricingRuleScope.GLOBAL);
        request.setType(PricingRuleType.PERCENTAGE_MARKUP);
        request.setValue(new BigDecimal("1000.01"));

        assertThrows(BusinessException.class, () -> service.createRule(request));
    }
}