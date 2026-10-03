package com.store.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailOtpResendRequest {

    @NotBlank(message = "Verification challenge is required")
    private String challengeId;

    public UUID requireChallengeId() {
        try {
            return UUID.fromString(challengeId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid verification challenge");
        }
    }
}
