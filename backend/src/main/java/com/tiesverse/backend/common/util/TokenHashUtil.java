package com.tiesverse.backend.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Hashes bearer/opaque tokens before they're persisted, so a database read (backup leak,
 * SQLi elsewhere, insider access) doesn't hand over live credentials. Callers must hash
 * the incoming token the same way before querying by it - this is not reversible.
 */
public final class TokenHashUtil {

    private TokenHashUtil() {
    }

    public static String sha256Hex(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
