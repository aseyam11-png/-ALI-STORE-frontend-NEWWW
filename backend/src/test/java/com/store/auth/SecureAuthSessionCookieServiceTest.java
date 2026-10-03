package com.store.auth;

import com.store.auth.service.AuthSessionCookieService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.auth.cookie-secure=true",
        "app.auth.cookie-same-site=None"
})
class SecureAuthSessionCookieServiceTest {

    @Autowired
    private AuthSessionCookieService cookieService;

    @Test
    void secureAuthenticationCookie_usesSecureFlagAndSameSiteNone() {
        ResponseCookie cookie = cookieService.buildCookie("signed-jwt-payload-for-test", 3600);

        assertTrue(cookie.isSecure());
        assertEquals("None", cookie.getSameSite());
        assertTrue(cookie.isHttpOnly());
        assertEquals("/", cookie.getPath());
    }
}
