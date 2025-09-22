package com.arbeit.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class JobDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String companyName;
    private String businessName;

    // Location Information
    private String location;
    private String city;
    private String state;
    private String country;
    private boolean remoteWork;

    // Job Details
    private String jobType;
    private String department;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;
    private String benefits;
    private String qualification;
    private List<String> skillsRequired;

    // Salary Information
    private Double salaryMin;
    private Double salaryMax;
    private String salaryCurrency;
    private boolean hideSalary;

    // Additional Information
    private List<String> screeningQuestions;
    private String hiringProcess;
    private String applicationInstructions;

    // Constructors
    public JobDTO() {}

    // Getters and Setters
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
}
