package com.arbeit.backend.controller;

import com.arbeit.backend.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/project")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProjectController {

    private final GeminiService geminiService;

    public ProjectController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/plan")
    public ResponseEntity<?> generateProjectPlan(@RequestBody Map<String, String> request) {
        try {
            String title = request.get("title");
            String description = request.get("description");

            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Project title is required"));
            }

            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Project description is required"));
            }

            String plan = geminiService.generateProjectPlan(title, description);

            return ResponseEntity.ok(Map.of("plan", plan));
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
                    .body(Map.of("error", "Failed to generate project plan"));
        }
    }
}
