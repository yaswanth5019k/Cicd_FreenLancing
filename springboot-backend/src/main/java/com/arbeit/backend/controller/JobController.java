package com.arbeit.backend.controller;

import com.arbeit.backend.dto.JobDTO;
import com.arbeit.backend.model.Job;
import com.arbeit.backend.service.JobService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        try {
            List<Job> jobs = jobService.getAllActiveJobs();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> getJobById(@RequestBody Map<String, String> request) {
        try {
            String jobId = request.get("jobId");
            if (jobId == null || jobId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "jobId is required"));
            }

            Optional<Job> jobOpt = jobService.getJobById(jobId);
            if (jobOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Job not found"));
            }

            return ResponseEntity.ok(jobOpt.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch job"));
        }
    }
}
