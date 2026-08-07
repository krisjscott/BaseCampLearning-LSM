package com.tiesverse.backend.common.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.jackson2.OAuth2ClientJackson2Module;

import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

public class cookieUtil {

    // JSON (not native Java) serialization for cookie round-tripping: the cookie value is
    // attacker-controlled input, and Java's SerializationUtils.deserialize() on untrusted
    // bytes is an unauthenticated remote-code-execution gadget (CWE-502). Jackson with a
    // fixed target type - no polymorphic/default typing enabled - has no equivalent risk.
    private static final ObjectMapper COOKIE_OBJECT_MAPPER = new ObjectMapper()
            .registerModule(new OAuth2ClientJackson2Module());

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }
        return Optional.empty();
    }

    public static void addCookie(HttpServletRequest request, HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        // Secure mirrors the inbound request's scheme so local HTTP dev keeps working while
        // any HTTPS deployment gets the cookie locked to HTTPS. SameSite=Lax (not Strict) is
        // required here: this cookie must still be sent on the top-level GET redirect Google
        // sends the browser back to our /login/oauth2/code/** callback with.
        cookie.setSecure(request.isSecure());
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                }
            }
        }
    }

    public static String serialize(Object object) {
        try {
            byte[] json = COOKIE_OBJECT_MAPPER.writeValueAsBytes(object);
            return Base64.getUrlEncoder().encodeToString(json);
        } catch (Exception e) {
            throw new UncheckedIOException(new java.io.IOException("Failed to serialize cookie value", e));
        }
    }

    public static <T> T deserialize(Cookie cookie, Class<T> cls) {
        try {
            byte[] json = Base64.getUrlDecoder().decode(cookie.getValue().getBytes(StandardCharsets.UTF_8));
            return COOKIE_OBJECT_MAPPER.readValue(json, cls);
        } catch (Exception e) {
            return null;
        }
    }
}