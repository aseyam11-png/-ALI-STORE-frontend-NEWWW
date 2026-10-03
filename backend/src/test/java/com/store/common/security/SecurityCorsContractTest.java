package com.store.common.security;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class SecurityCorsContractTest {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void cors_allowsCredentialedBrowserCheckoutAndXsrfContract() {
        HttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest(
                "OPTIONS", "/api/v1/orders");

        CorsConfiguration configuration =
                corsConfigurationSource.getCorsConfiguration(request);

        assertNotNull(configuration);
        assertTrue(configuration.getAllowedOrigins().contains("http://localhost:3000"));
        assertTrue(configuration.getAllowedMethods().contains("OPTIONS"));
        assertTrue(configuration.getAllowedHeaders().contains("X-XSRF-TOKEN"));
        assertTrue(configuration.getAllowedHeaders().contains("Content-Type"));
        assertTrue(configuration.getAllowedHeaders().contains("Idempotency-Key"));
        assertTrue(configuration.getExposedHeaders().contains("Retry-After"));
        assertEquals(3600L, configuration.getMaxAge());
        assertTrue(configuration.getAllowCredentials());
        assertFalse(configuration.getAllowedHeaders().contains("*"));
        assertFalse(configuration.getAllowedOrigins().contains("*"));
    }
}