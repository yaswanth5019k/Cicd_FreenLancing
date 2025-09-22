package com.arbeit.backend.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String jobId; // Unique job identifier (e.g., "J123456")

    // Basic Job Information
    private String title;
    private String companyName;
    private String businessName; // Alternative company name field

    // Company Information
    @Column(nullable = false)
    private String companyEmail; // Email of the company that posted the job
    private String bid; // Business ID of the company

    // Location Information
    private String location;
    private String city;
    private String state;
    private String country;
    private boolean remoteWork; // Whether remote work is allowed

    // Job Details
    private String jobType; // Full-time, Part-time, Contract, Internship
    private String department;
    private String description;
    private String requirements;
    private String benefits;
    private String qualification;

    @Convert(converter = StringListConverter.class)
    private List<String> skillsRequired;

    // Salary Information
    private Double salaryMin;
    private Double salaryMax;
    private String salaryCurrency = "USD";
    private boolean hideSalary; // Whether to hide salary information

    // Additional Information
    @Convert(converter = StringListConverter.class)
    private List<String> screeningQuestions;
    private String hiringProcess;
    private String applicationInstructions;

    // Job Status
    private String status = "Active"; // Active, Inactive, Closed, Draft
    private int applicants = 0; // Number of applicants

    // Timestamps
    private LocalDateTime postedDate;
    private LocalDateTime updatedDate;
    private LocalDateTime closingDate;

    // Constructors
    public Job() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getBid() {
        return bid;
    }

    public void setBid(String bid) {
        this.bid = bid;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public boolean isRemoteWork() {
        return remoteWork;
    }

    public void setRemoteWork(boolean remoteWork) {
        this.remoteWork = remoteWork;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public List<String> getSkillsRequired() {
        return skillsRequired;
    }

    public void setSkillsRequired(List<String> skillsRequired) {
        this.skillsRequired = skillsRequired;
    }

    public Double getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(Double salaryMin) {
        this.salaryMin = salaryMin;
    }

    public Double getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(Double salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getSalaryCurrency() {
        return salaryCurrency;
    }

    public void setSalaryCurrency(String salaryCurrency) {
        this.salaryCurrency = salaryCurrency;
    }

    public boolean isHideSalary() {
        return hideSalary;
    }

    public void setHideSalary(boolean hideSalary) {
        this.hideSalary = hideSalary;
    }

    public List<String> getScreeningQuestions() {
        return screeningQuestions;
    }

    public void setScreeningQuestions(List<String> screeningQuestions) {
        this.screeningQuestions = screeningQuestions;
    }

    public String getHiringProcess() {
        return hiringProcess;
    }

    public void setHiringProcess(String hiringProcess) {
        this.hiringProcess = hiringProcess;
    }

    public String getApplicationInstructions() {
        return applicationInstructions;
    }

    public void setApplicationInstructions(String applicationInstructions) {
        this.applicationInstructions = applicationInstructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getApplicants() {
        return applicants;
    }

    public void setApplicants(int applicants) {
        this.applicants = applicants;
    }

    public LocalDateTime getPostedDate() {
        return postedDate;
    }

    public void setPostedDate(LocalDateTime postedDate) {
        this.postedDate = postedDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public LocalDateTime getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(LocalDateTime closingDate) {
        this.closingDate = closingDate;
    }

    // Helper methods
    public String getCompany() {
        return businessName != null ? businessName : companyName;
    }

    public String getSalaryRange() {
        if (hideSalary || salaryMin == null || salaryMax == null) {
            return "Salary not disclosed";
        }
        return salaryCurrency + " " + salaryMin + " - " + salaryMax;
    }

    public void incrementApplicants() {
        this.applicants++;
    }

    @Override
    public String toString() {
        return "Job{" +
                "id=" + id +
                ", jobId='" + jobId + '\'' +
                ", title='" + title + '\'' +
                ", companyName='" + companyName + '\'' +
                ", status='" + status + '\'' +
                ", postedDate=" + postedDate +
                '}';
    }
}
