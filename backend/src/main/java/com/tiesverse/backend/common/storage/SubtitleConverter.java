package com.tiesverse.backend.common.storage;

import com.tiesverse.backend.common.exception.BadRequestException;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/**
 * Normalizes an uploaded caption file to WebVTT, the only format the HTML5
 * {@code <track>} element accepts. SRT and VTT share the same cue structure -
 * the only structural difference is the timestamp separator (comma vs dot)
 * and the required "WEBVTT" header - so this is a plain text transform, no
 * external library needed.
 */
public final class SubtitleConverter {

    private static final Pattern SRT_TIMESTAMP = Pattern.compile("(\\d{2}:\\d{2}:\\d{2}),(\\d{3})");

    private SubtitleConverter() {
    }

    public static String toVtt(byte[] content, String originalFilename) {
        String text = new String(content, StandardCharsets.UTF_8).replace("\r\n", "\n").strip();
        String extension = FileStorageService.extensionOf(originalFilename);

        if (extension.equals("vtt")) {
            return text.startsWith("WEBVTT") ? text : "WEBVTT\n\n" + text;
        }
        if (extension.equals("srt")) {
            String body = SRT_TIMESTAMP.matcher(text).replaceAll("$1.$2");
            return "WEBVTT\n\n" + body;
        }
        throw new BadRequestException("Captions must be a .vtt or .srt file");
    }
}
