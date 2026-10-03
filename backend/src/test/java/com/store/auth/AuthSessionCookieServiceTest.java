package com.store.auth;

import com.store.auth.service.AuthSessionCookieService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class AuthSessionCookieServiceTest {

    @Autowired
    private AuthSessionCookieService cookieService;

    @Test
    void encryptedCookie_roundTrips_andUsesHttpOnlyAndSameSite() {
        String jwt = "signed-jwt-payload-for-test";

        ResponseCookie cookie = cookieService.buildCookie(jwt, 3600);

        assertTrue(cookie.getValue().startsWith("v1."));
        assertNotEquals(jwt, cookie.getValue());
        assertEquals(jwt, cookieService.decrypt(cookie.getValue()));
        assertTrue(cookie.isHttpOnly());
        assertEquals("Lax", cookie.getSameSite());
        assertEquals("/", cookie.getPath());
        assertTrue(cookie.getMaxAge().getSeconds() > 0);
    }

    @Test
    void tamperedCookie_isRejected() {
        String encrypted = cookieService.encrypt("jwt-value");
        String tampered = encrypted.substring(0, encrypted.length() - 1)
                + (encrypted.endsWith("A") ? "B" : "A");

        assertThrows(SecurityException.class, () -> cookieService.decrypt(tampered));
    }
}
