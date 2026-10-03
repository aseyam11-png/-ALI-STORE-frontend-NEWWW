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
        String[] parts = encrypted.split("\\.", -1);
        String originalCiphertext = parts[2];
        char replacement = originalCiphertext.charAt(0) == 'A' ? 'B' : 'A';
        String tampered = parts[0] + "." + parts[1] + "."
                + replacement + originalCiphertext.substring(1);

        assertThrows(SecurityException.class, () -> cookieService.decrypt(tampered));
    }

    @Test
    void encrypt_usesFreshNonceForEachCookie() {
        String first = cookieService.encrypt("same-jwt");
        String second = cookieService.encrypt("same-jwt");

        assertNotEquals(first, second);
        assertNotEquals(
                first.split("\\.", -1)[1],
                second.split("\\.", -1)[1],
                "GCM must use a fresh IV for each encryption");
    }

    @Test
    void clearCookie_isHttpOnlyScopedAndImmediatelyExpired() {
        ResponseCookie cookie = cookieService.clearCookie();

        assertEquals("", cookie.getValue());
        assertEquals(0, cookie.getMaxAge().getSeconds());
        assertTrue(cookie.isHttpOnly());
        assertEquals("/", cookie.getPath());
        assertEquals("Lax", cookie.getSameSite());
    }
}
