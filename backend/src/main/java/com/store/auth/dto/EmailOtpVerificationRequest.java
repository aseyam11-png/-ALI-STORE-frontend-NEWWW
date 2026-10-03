package com.store.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailOtpVerificationRequest {

    @NotBlank(message = "Verification challenge is required")
    private String challengeId;

    @NotBlank(message = "Verification code is required")
    @Pattern(regexp = "\\d{6}", message = "Verification code must contain exactly 6 digits")
    private String code;

    public UUID requireChallengeId() {
        try {
            return UUID.fromString(challengeId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid verification challenge");
        }
    }
}
