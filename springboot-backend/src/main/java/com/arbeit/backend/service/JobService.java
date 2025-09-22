package com.arbeit.backend.service;

import com.arbeit.backend.dto.JobDTO;
import com.arbeit.backend.model.Company;
import com.arbeit.backend.model.Job;
import com.arbeit.backend.repository.CompanyRepository;
import com.arbeit.backend.repository.JobRepository;
import com.arbeit.backend.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JwtUtils jwtUtils;

    public JobService(JobRepository jobRepository, CompanyRepository companyRepository, JwtUtils jwtUtils) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.jwtUtils = jwtUtils;
    }

    public List<Job> getAllActiveJobs() {
        return jobRepository.findActiveJobsSortedByPostedDate();
    }

    public Optional<Job> getJobById(String jobId) {
        return jobRepository.findActiveJobByJobId(jobId);
    }

    public Job createJob(JobDTO jobDTO, String companyEmail) {
        Optional<Company> companyOpt = companyRepository.findByCompanyEmail(companyEmail);
        if (companyOpt.isEmpty()) {
            throw new RuntimeException("Company not found");
        }

        Company company = companyOpt.get();

        Job job = new Job();
        job.setJobId(generateUniqueJobId());
        job.setTitle(jobDTO.getTitle());
        job.setCompanyName(company.getCompanyName());
        job.setBusinessName(company.getCompanyName());
        job.setCompanyEmail(companyEmail);
        job.setBid(company.getBid());
        job.setLocation(jobDTO.getLocation());
        job.setCity(jobDTO.getCity());
        job.setState(jobDTO.getState());
        job.setCountry(jobDTO.getCountry());
        job.setRemoteWork(jobDTO.isRemoteWork());
        job.setJobType(jobDTO.getJobType());
        job.setDepartment(jobDTO.getDepartment());
        job.setDescription(jobDTO.getDescription());
        job.setRequirements(jobDTO.getRequirements());
        job.setBenefits(jobDTO.getBenefits());
        job.setQualification(jobDTO.getQualification());
        job.setSkillsRequired(jobDTO.getSkillsRequired());
        job.setSalaryMin(jobDTO.getSalaryMin());
        job.setSalaryMax(jobDTO.getSalaryMax());
        job.setSalaryCurrency(jobDTO.getSalaryCurrency() != null ? jobDTO.getSalaryCurrency() : "USD");
        job.setHideSalary(jobDTO.isHideSalary());
        job.setScreeningQuestions(jobDTO.getScreeningQuestions());
        job.setHiringProcess(jobDTO.getHiringProcess());
        job.setApplicationInstructions(jobDTO.getApplicationInstructions());
        job.setStatus("Active");
        job.setApplicants(0);
        job.setPostedDate(LocalDateTime.now());
        job.setUpdatedDate(LocalDateTime.now());

        return jobRepository.save(job);
    }

    public List<Job> getCompanyJobs(String companyEmail) {
        return jobRepository.findByCompanyEmail(companyEmail);
    }

    public Optional<Job> updateJob(String jobId, JobDTO jobDTO, String companyEmail) {
        Optional<Job> jobOpt = jobRepository.findByJobId(jobId);
        if (jobOpt.isEmpty()) {
            return Optional.empty();
        }

        Job job = jobOpt.get();

        // Verify ownership
        if (!job.getCompanyEmail().equals(companyEmail)) {
            throw new RuntimeException("Unauthorized to update this job");
        }

        // Update fields
        if (jobDTO.getTitle() != null) job.setTitle(jobDTO.getTitle());
        if (jobDTO.getLocation() != null) job.setLocation(jobDTO.getLocation());
        if (jobDTO.getCity() != null) job.setCity(jobDTO.getCity());
        if (jobDTO.getState() != null) job.setState(jobDTO.getState());
        if (jobDTO.getCountry() != null) job.setCountry(jobDTO.getCountry());
        job.setRemoteWork(jobDTO.isRemoteWork());
        if (jobDTO.getJobType() != null) job.setJobType(jobDTO.getJobType());
        if (jobDTO.getDepartment() != null) job.setDepartment(jobDTO.getDepartment());
        if (jobDTO.getDescription() != null) job.setDescription(jobDTO.getDescription());
        if (jobDTO.getRequirements() != null) job.setRequirements(jobDTO.getRequirements());
        if (jobDTO.getBenefits() != null) job.setBenefits(jobDTO.getBenefits());
        if (jobDTO.getQualification() != null) job.setQualification(jobDTO.getQualification());
        if (jobDTO.getSkillsRequired() != null) job.setSkillsRequired(jobDTO.getSkillsRequired());
        if (jobDTO.getSalaryMin() != null) job.setSalaryMin(jobDTO.getSalaryMin());
        if (jobDTO.getSalaryMax() != null) job.setSalaryMax(jobDTO.getSalaryMax());
        if (jobDTO.getSalaryCurrency() != null) job.setSalaryCurrency(jobDTO.getSalaryCurrency());
        job.setHideSalary(jobDTO.isHideSalary());
        if (jobDTO.getScreeningQuestions() != null) job.setScreeningQuestions(jobDTO.getScreeningQuestions());
        if (jobDTO.getHiringProcess() != null) job.setHiringProcess(jobDTO.getHiringProcess());
        if (jobDTO.getApplicationInstructions() != null) job.setApplicationInstructions(jobDTO.getApplicationInstructions());

        job.setUpdatedDate(LocalDateTime.now());

        return Optional.of(jobRepository.save(job));
    }

    public boolean deleteJob(String jobId, String companyEmail) {
        Optional<Job> jobOpt = jobRepository.findByJobId(jobId);
        if (jobOpt.isEmpty()) {
            return false;
        }

        Job job = jobOpt.get();

        // Verify ownership
        if (!job.getCompanyEmail().equals(companyEmail)) {
            throw new RuntimeException("Unauthorized to delete this job");
        }

        jobRepository.delete(job);
        return true;
    }

    public void incrementApplicantCount(String jobId) {
        Optional<Job> jobOpt = jobRepository.findByJobId(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();
            job.setApplicants(job.getApplicants() + 1);
            jobRepository.save(job);
        }
    }

    private String generateUniqueJobId() {
        String jobId;
        do {
            // Generate a random 6-digit number prefixed with 'J'
            jobId = 'J' + String.format("%06d", (int)(Math.random() * 1000000));
        } while (jobRepository.existsByJobId(jobId));

        return jobId;
    }
}
