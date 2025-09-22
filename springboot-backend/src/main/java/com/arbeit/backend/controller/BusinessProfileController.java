package com.arbeit.backend.controller;

import com.arbeit.backend.dto.CompanyProfileDTO;
import com.arbeit.backend.model.Company;
import com.arbeit.backend.service.ProfileService;
import com.arbeit.backend.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/business/profile")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BusinessProfileController {

    private final ProfileService profileService;
    private final JwtUtils jwtUtils;

    public BusinessProfileController(ProfileService profileService, JwtUtils jwtUtils) {
        this.profileService = profileService;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping
    public ResponseEntity<?> getCompanyProfile(@CookieValue(value = "accessToken", required = false) String accessToken) {
        try {
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            String companyEmail = jwtUtils.getUsernameFromToken(accessToken);
            String role = jwtUtils.getRoleFromToken(accessToken);

            if (!"business".equals(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            Optional<Company> companyOpt = profileService.getCompanyProfile(companyEmail);
            if (companyOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Company not found"));
            }

            // Remove sensitive fields before returning
            Company company = companyOpt.get();
            company.setPassword(null);

            // Return only necessary fields
            Map<String, Object> profile = Map.of(
                "companyEmail", company.getCompanyEmail(),
                "companyName", company.getCompanyName(),
                "name", company.getName(),
                "bid", company.getBid()
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch company profile"));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateCompanyProfile(@RequestBody CompanyProfileDTO profileDTO,
                                                 @CookieValue(value = "accessToken", required = false) String accessToken) {
        try {
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            String companyEmail = jwtUtils.getUsernameFromToken(accessToken);
            String role = jwtUtils.getRoleFromToken(accessToken);

            if (!"business".equals(role)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            Optional<Company> updatedCompany = profileService.updateCompanyProfile(companyEmail, profileDTO);
            if (updatedCompany.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Company not found"));
            }

            // Remove sensitive fields before returning
            Company company = updatedCompany.get();
            company.setPassword(null);

            return ResponseEntity.ok(Map.of("message", "Company profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update company profile"));
        }
    }
}
