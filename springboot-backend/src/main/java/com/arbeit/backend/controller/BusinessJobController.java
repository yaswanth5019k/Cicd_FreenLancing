package com.arbeit.backend.controller;

import com.arbeit.backend.dto.JobDTO;
import com.arbeit.backend.model.Job;
import com.arbeit.backend.service.JobService;
import com.arbeit.backend.security.JwtUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/business/jobs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BusinessJobController {

    private final JobService jobService;
    private final JwtUtils jwtUtils;

    public BusinessJobController(JobService jobService, JwtUtils jwtUtils) {
        this.jobService = jobService;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping
    public ResponseEntity<?> getCompanyJobs(@CookieValue(value = "accessToken", required = false) String accessToken) {
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

            List<Job> jobs = jobService.getCompanyJobs(companyEmail);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch company jobs"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobDTO jobDTO,
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

            Job createdJob = jobService.createJob(jobDTO, companyEmail);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Job posted successfully", "jobId", createdJob.getJobId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create job"));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateJob(@RequestBody Map<String, Object> request,
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

            String jobId = (String) request.get("jobId");
            if (jobId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "jobId is required"));
            }

            // Remove jobId from the update data and create JobDTO
            request.remove("jobId");
            JobDTO jobDTO = new JobDTO();
            // This is a simplified approach - in a real application you'd use a proper JSON mapper
            if (request.containsKey("title")) jobDTO.setTitle((String) request.get("title"));
            if (request.containsKey("description")) jobDTO.setDescription((String) request.get("description"));
            if (request.containsKey("location")) jobDTO.setLocation((String) request.get("location"));
            if (request.containsKey("jobType")) jobDTO.setJobType((String) request.get("jobType"));
            if (request.containsKey("department")) jobDTO.setDepartment((String) request.get("department"));
            if (request.containsKey("requirements")) jobDTO.setRequirements((String) request.get("requirements"));
            if (request.containsKey("benefits")) jobDTO.setBenefits((String) request.get("benefits"));
            if (request.containsKey("qualification")) jobDTO.setQualification((String) request.get("qualification"));
            if (request.containsKey("salaryMin")) jobDTO.setSalaryMin(((Number) request.get("salaryMin")).doubleValue());
            if (request.containsKey("salaryMax")) jobDTO.setSalaryMax(((Number) request.get("salaryMax")).doubleValue());
            if (request.containsKey("hideSalary")) jobDTO.setHideSalary((Boolean) request.get("hideSalary"));
            if (request.containsKey("remoteWork")) jobDTO.setRemoteWork((Boolean) request.get("remoteWork"));

            Optional<Job> updatedJob = jobService.updateJob(jobId, jobDTO, companyEmail);
            if (updatedJob.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Job not found"));
            }

            return ResponseEntity.ok(Map.of("message", "Job updated successfully", "job", updatedJob.get()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update job"));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteJob(@RequestBody Map<String, String> request,
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

            String jobId = request.get("jobId");
            if (jobId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "jobId is required"));
            }

            boolean deleted = jobService.deleteJob(jobId, companyEmail);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Job not found"));
            }

            return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete job"));
        }
    }
}
