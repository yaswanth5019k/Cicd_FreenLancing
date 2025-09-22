package com.arbeit.backend.controller;

import com.arbeit.backend.dto.UserProfileDTO;
import com.arbeit.backend.model.User;
import com.arbeit.backend.service.ProfileService;
import com.arbeit.backend.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProfileController {

    private final ProfileService profileService;
    private final JwtUtils jwtUtils;

    public ProfileController(ProfileService profileService, JwtUtils jwtUtils) {
        this.profileService = profileService;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping
    public ResponseEntity<?> getUserProfile(@CookieValue(value = "accessToken", required = false) String accessToken) {
        try {
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            String email = jwtUtils.getUsernameFromToken(accessToken);
            String role = jwtUtils.getRoleFromToken(accessToken);

            if (!"user".equals(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            Optional<User> userOpt = profileService.getUserProfile(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Remove sensitive fields before returning
            User user = userOpt.get();
            user.setPassword(null);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch profile"));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileDTO profileDTO,
                                              @CookieValue(value = "accessToken", required = false) String accessToken) {
        try {
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            String email = jwtUtils.getUsernameFromToken(accessToken);
            String role = jwtUtils.getRoleFromToken(accessToken);

            if (!"user".equals(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            Optional<User> updatedUser = profileService.updateUserProfile(email, profileDTO);
            if (updatedUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Remove sensitive fields before returning
            User user = updatedUser.get();
            user.setPassword(null);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully", "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile"));
        }
    }
}
