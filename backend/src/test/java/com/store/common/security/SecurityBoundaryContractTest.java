package com.store.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class SecurityBoundaryContractTest {

    @Test
    void clientIpResolver_doesNotTrustForwardedHeaderFromUnknownPeer() {
        ClientIpResolver resolver = new ClientIpResolver("");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.10");
        request.addHeader("X-Forwarded-For", "203.0.113.7");

        assertEquals("198.51.100.10", resolver.resolve(request));
    }

    @Test
    void clientIpResolver_usesFirstForwardedAddressOnlyWhenImmediatePeerIsTrusted() {
        ClientIpResolver resolver = new ClientIpResolver("10.0.0.10, 10.0.0.11");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.10");
        request.addHeader("X-Forwarded-For", "203.0.113.7, 198.51.100.25");

        assertEquals("203.0.113.7", resolver.resolve(request));
    }

    @Test
    void clientIpResolver_rejectsSpoofingWhenAttackerConnectsDirectly() {
        ClientIpResolver resolver = new ClientIpResolver("10.0.0.10");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.10");
        request.addHeader("X-Forwarded-For", "203.0.113.7");

        assertEquals("198.51.100.10", resolver.resolve(request));
    }

    @Test
    void rateLimiter_enforcesLimitPerKeyWithoutCrossClientContamination() {
        RateLimiter limiter = new RateLimiter();

        assertTrue(limiter.tryConsume("client-a:/login", 2, 60_000));
        assertTrue(limiter.tryConsume("client-a:/login", 2, 60_000));
        assertFalse(limiter.tryConsume("client-a:/login", 2, 60_000));

        assertTrue(limiter.tryConsume("client-b:/login", 2, 60_000));
    }
}
