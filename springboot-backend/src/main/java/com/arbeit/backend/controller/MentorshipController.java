package com.arbeit.backend.controller;

import com.arbeit.backend.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/mentorship")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MentorshipController {

    private final GeminiService geminiService;

    public MentorshipController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/roadmap")
    public ResponseEntity<?> generateRoadmap(@RequestBody Map<String, String> request) {
        try {
            String dreamRole = request.get("dreamRole");
            String currentSkills = request.get("currentSkills");

            if (dreamRole == null || dreamRole.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Dream role is required"));
            }

            String roadmap = geminiService.generateRoadmap(dreamRole, currentSkills);

            return ResponseEntity.ok(Map.of(
                "roadmap", roadmap,
                "success", true
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("API key")) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "AI service configuration error"));
            } else if (e.getMessage().contains("Failed to generate")) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "AI service temporarily unavailable"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", e.getMessage()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate roadmap"));
        }
    }
}
