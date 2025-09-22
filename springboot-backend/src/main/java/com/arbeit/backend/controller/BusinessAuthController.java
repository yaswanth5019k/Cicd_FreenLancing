package com.arbeit.backend.controller;

import com.arbeit.backend.dto.AuthRequest;
import com.arbeit.backend.dto.AuthResponse;
import com.arbeit.backend.dto.BusinessRegistrationRequest;
import com.arbeit.backend.dto.LoginResponse;
import com.arbeit.backend.service.BusinessAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/business")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BusinessAuthController {

    private final BusinessAuthService businessAuthService;

    public BusinessAuthController(BusinessAuthService businessAuthService) {
        this.businessAuthService = businessAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = businessAuthService.login(request);

            // Set JWT tokens as HTTP-only cookies
            Cookie accessTokenCookie = new Cookie("accessToken", loginResponse.getAccessToken());
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setSecure(false); // Set to true in production with HTTPS
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(300); // 5 minutes

            Cookie refreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
            refreshTokenCookie.setPath("/");
            refreshTokenCookie.setMaxAge(900); // 15 minutes

            response.addCookie(accessTokenCookie);
            response.addCookie(refreshTokenCookie);

            // Don't send tokens in response body for security
            AuthResponse authResponse = new AuthResponse(loginResponse.getMessage(),
                    loginResponse.getBid(), loginResponse.getEmail(), loginResponse.getRole());

            return ResponseEntity.ok(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Business login failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody BusinessRegistrationRequest request) {
        try {
            AuthResponse authResponse = businessAuthService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Business registration failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken,
                                         HttpServletResponse response) {
        try {
            if (refreshToken == null) {
                return ResponseEntity.noContent().build();
            }

            String newAccessToken = businessAuthService.refreshToken(refreshToken);

            // Set new access token cookie
            Cookie accessTokenCookie = new Cookie("accessToken", newAccessToken);
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setSecure(false); // Set to true in production with HTTPS
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(300); // 5 minutes

            response.addCookie(accessTokenCookie);

            return ResponseEntity.ok(new AuthResponse("Business token refreshed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse("Token refresh failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse("Internal server error"));
        }
    }
}
