package com.store.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.auth.service.CustomUserDetailsService;
import com.store.auth.service.GoogleOAuth2FailureHandler;
import com.store.auth.service.GoogleOAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;
    private final ClientIpResolver clientIpResolver;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuth2FailureHandler googleOAuth2FailureHandler;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private List<String> allowedOrigins;

    @Value("${app.auth.cookie-secure:false}")
    private boolean authCookieSecure;

    @Value("${app.auth.cookie-domain:}")
    private String authCookieDomain;

    @Value("${app.auth.cookie-same-site:}")
    private String authCookieSameSite;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookiePath("/");
        csrfRepository.setCookieCustomizer(cookie -> {
            cookie.secure(authCookieSecure)
                    .sameSite(resolveCookieSameSite());
            if (authCookieDomain != null && !authCookieDomain.isBlank()) {
                cookie.domain(authCookieDomain);
            }
        });

        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        RequestMatcher bearerAuthentication = request -> {
            String authorization = request.getHeader("Authorization");
            return authorization != null && authorization.startsWith("Bearer ");
        };

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(csrfHandler)
                        .ignoringRequestMatchers(
                                new AntPathRequestMatcher("/api/v1/auth/login"),
                                new AntPathRequestMatcher("/api/v1/auth/register"),
                                new AntPathRequestMatcher("/api/v1/auth/csrf"),
                                new AntPathRequestMatcher("/api/v1/auth/google"),
                                new AntPathRequestMatcher("/api/v1/integrations/suppliers/shipments/update"),
                                bearerAuthentication
                        ))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exceptions -> exceptions
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/logout",
                                "/api/v1/auth/csrf",
                                "/api/v1/auth/google",
                                "/api/v1/auth/email/verify",
                                "/api/v1/auth/email/resend",
                                "/oauth2/authorization/**",
                                "/login/oauth2/code/**",
                                "/api/v1/integrations/suppliers/shipments/update",
                                "/api/v1/health/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET,
                                "/api/v1/categories", "/api/v1/categories/**",
                                "/api/v1/products", "/api/v1/products/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(googleOAuth2SuccessHandler)
                        .failureHandler(googleOAuth2FailureHandler))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new AuthRateLimitFilter(rateLimiter, objectMapper, clientIpResolver), JwtAuthenticationFilter.class)
                .headers(headers -> headers
                        .contentTypeOptions(contentTypeOptions -> {})
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(TimeUnit.DAYS.toSeconds(365)))
                        .referrerPolicy(referrer -> referrer
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy",
                                "geolocation=(), camera=(), microphone=(), payment=()"))
                );

        return http.build();
    }

    private String resolveCookieSameSite() {
        if (authCookieSameSite == null || authCookieSameSite.isBlank()) {
            return authCookieSecure ? "None" : "Lax";
        }
        return authCookieSameSite;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
