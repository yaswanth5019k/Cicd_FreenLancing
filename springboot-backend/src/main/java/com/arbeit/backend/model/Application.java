package com.arbeit.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userId; // 3-digit unique identifier for the applicant

    @Column(nullable = false)
    private String jobId; // Job being applied for

    // Applicant Information
    private String fullName;
    private String email;
    private String phone;

    // Application Details
    private String coverLetter;
    private String status = "Pending"; // Pending, Under Review, Shortlisted, Rejected, Accepted

    // Resume Information
    private String resumeFileName;
    private String resumeId; // GridFS file ID

    // Additional Information
    private String experience;
    private String currentCompany;
    private String currentJobTitle;
    private String education;
    private String linkedinUrl;
    private String portfolioUrl;

    // Timestamps
    private LocalDateTime appliedDate;
    private LocalDateTime updatedDate;
    private LocalDateTime reviewedDate;

    // Review Information
    private String reviewerNotes;
    private Integer rating; // 1-5 rating from reviewer

    // Constructors
    public Application() {}

    public Application(String userId, String jobId, String email) {
        this.userId = userId;
        this.jobId = jobId;
        this.email = email;
        this.appliedDate = LocalDateTime.now();
        this.updatedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
        if ("Under Review".equals(status) && this.reviewedDate == null) {
            this.reviewedDate = LocalDateTime.now();
        }
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getResumeId() {
        return resumeId;
    }

    public void setResumeId(String resumeId) {
        this.resumeId = resumeId;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getCurrentCompany() {
        return currentCompany;
    }

    public void setCurrentCompany(String currentCompany) {
        this.currentCompany = currentCompany;
    }

    public String getCurrentJobTitle() {
        return currentJobTitle;
    }

    public void setCurrentJobTitle(String currentJobTitle) {
        this.currentJobTitle = currentJobTitle;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public LocalDateTime getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDateTime appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public LocalDateTime getReviewedDate() {
        return reviewedDate;
    }

    public void setReviewedDate(LocalDateTime reviewedDate) {
        this.reviewedDate = reviewedDate;
    }

    public String getReviewerNotes() {
        return reviewerNotes;
    }

    public void setReviewerNotes(String reviewerNotes) {
        this.reviewerNotes = reviewerNotes;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    // Helper methods
    public boolean isPending() {
        return "Pending".equals(status);
    }

    public boolean isUnderReview() {
        return "Under Review".equals(status);
    }

    public boolean isShortlisted() {
        return "Shortlisted".equals(status);
    }

    public boolean isRejected() {
        return "Rejected".equals(status);
    }

    public boolean isAccepted() {
        return "Accepted".equals(status);
    }

    @Override
    public String toString() {
        return "Application{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", jobId='" + jobId + '\'' +
                ", email='" + email + '\'' +
                ", status='" + status + '\'' +
                ", appliedDate=" + appliedDate +
                '}';
    }
}
