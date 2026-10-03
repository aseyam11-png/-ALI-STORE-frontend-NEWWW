package com.store.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_tokens",
        indexes = @Index(name = "idx_revoked_tokens_expires_at", columnList = "expires_at"),
        uniqueConstraints = @UniqueConstraint(name = "uk_revoked_token_hash", columnNames = "token_hash"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevokedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @JdbcTypeCode(SqlTypes.TIMESTAMP_WITH_TIMEZONE)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @JdbcTypeCode(SqlTypes.TIMESTAMP_WITH_TIMEZONE)
    @Column(nullable = false)
    private LocalDateTime revokedAt;
}
