package com.tiesverse.backend.common.util;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Java port of {@code frontend/app/lib/idCodec.ts}: the same fixed-key XOR + base64url transform
 * used across the learner app to keep raw ids out of URLs. Not real security (the key ships in the
 * JS bundle), just URL hygiene — kept identical here so links built server-side (e.g. the QR
 * verification URL) match the tokens the frontend itself produces and expects to decode.
 */
public final class IdCodec {

    private static final int[] KEY = {
            0x7a, 0x4f, 0x9c, 0x1e, 0xb3, 0x62, 0xd8, 0x05, 0xf1, 0x3a, 0x88, 0x2c, 0x67, 0xe9, 0x14, 0x5b
    };

    private IdCodec() {
    }

    public static String encodeId(String value) {
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        byte[] xored = xor(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(xored);
    }

    private static byte[] xor(byte[] bytes) {
        byte[] output = new byte[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            output[i] = (byte) (bytes[i] ^ KEY[i % KEY.length]);
        }
        return output;
    }
}
