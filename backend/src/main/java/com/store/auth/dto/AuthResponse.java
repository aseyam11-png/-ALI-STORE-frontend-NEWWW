package com.store.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    @JsonIgnore
    @ToString.Exclude
    private String token;

    private String email;
    private String role;

    @Builder.Default
    private boolean requiresEmailVerification = false;

    private String challengeId;
    private String maskedEmail;
    private Long expiresInSeconds;
}
