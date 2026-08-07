package com.tiesverse.backend.security.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Access and refresh tokens are otherwise indistinguishable signed JWTs for the same
    // subject - without this claim, a captured refresh token (7x the access-token lifetime)
    // works as a bearer credential on every API call, and stays valid past logout/password
    // change since JwtFilter never consults the DB-stored refresh token at all.
    public static final String TYPE_CLAIM = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    public String generateToken(String subject, Map<String, Object> claims) {
        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .claim(TYPE_CLAIM, TYPE_ACCESS)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignKey())
                .compact();
    }

    public String generateRefreshToken(String subject) {
        return Jwts.builder()
                .subject(subject)
                .claim(TYPE_CLAIM, TYPE_REFRESH)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration * 7))
                .signWith(getSignKey())
                .compact();
    }

    public boolean isTokenValid(String token, String expectedSubject) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            String subject = claims.getSubject();
            Date expirationDate = claims.getExpiration();
            String type = claims.get(TYPE_CLAIM, String.class);
            return expectedSubject.equals(subject) && TYPE_REFRESH.equals(type)
                    && expirationDate != null && expirationDate.after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private SecretKey getSignKey() {
        if(secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret key config is empty");
        }
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
