package com.arbeit.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    @Value("${app.jwt.access-token-secret}")
    private String accessTokenSecret;

    @Value("${app.jwt.refresh-token-secret}")
    private String refreshTokenSecret;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private SecretKey getAccessTokenKey() {
        return Keys.hmacShaKeyFor(accessTokenSecret.getBytes());
    }

    private SecretKey getRefreshTokenKey() {
        return Keys.hmacShaKeyFor(refreshTokenSecret.getBytes());
    }

    public String generateAccessToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, username, accessTokenExpiration, getAccessTokenKey());
    }

    public String generateRefreshToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, username, refreshTokenExpiration, getRefreshTokenKey());
    }

    public String generateAccessTokenFromRefreshToken(String refreshToken) {
        final String username = extractUsernameFromRefreshToken(refreshToken);
        final String role = extractRoleFromRefreshToken(refreshToken);
        return generateAccessToken(username, role);
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime, SecretKey key) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject, getAccessTokenKey());
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaim(token, Claims::getSubject, getRefreshTokenKey());
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class), getAccessTokenKey());
    }

    public String extractRoleFromRefreshToken(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class), getRefreshTokenKey());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration, getAccessTokenKey());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, SecretKey key) {
        final Claims claims = extractAllClaims(token, key);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, SecretKey key) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public Boolean validateAccessToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Boolean validateRefreshToken(String token) {
        try {
            extractAllClaims(token, getRefreshTokenKey());
            return !isRefreshTokenExpired(token);
        } catch (ExpiredJwtException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Boolean isRefreshTokenExpired(String token) {
        try {
            return extractClaim(token, Claims::getExpiration, getRefreshTokenKey()).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public String getUsernameFromToken(String token) {
        return extractUsername(token);
    }

    public String getRoleFromToken(String token) {
        return extractRole(token);
    }
}
