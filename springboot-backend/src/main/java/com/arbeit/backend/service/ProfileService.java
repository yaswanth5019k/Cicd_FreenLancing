package com.arbeit.backend.service;

import com.arbeit.backend.dto.CompanyProfileDTO;
import com.arbeit.backend.dto.UserProfileDTO;
import com.arbeit.backend.model.Company;
import com.arbeit.backend.model.User;
import com.arbeit.backend.repository.CompanyRepository;
import com.arbeit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public ProfileService(UserRepository userRepository, CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    // User Profile Operations
    public Optional<User> getUserProfile(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> updateUserProfile(String email, UserProfileDTO profileDTO) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        // Update allowed fields (excluding sensitive ones like password, email, role)
        if (profileDTO.getFirstName() != null) user.setFirstName(profileDTO.getFirstName());
        if (profileDTO.getLastName() != null) user.setLastName(profileDTO.getLastName());
        if (profileDTO.getPhone() != null) user.setPhone(profileDTO.getPhone());
        if (profileDTO.getAddress() != null) user.setAddress(profileDTO.getAddress());
        if (profileDTO.getCity() != null) user.setCity(profileDTO.getCity());
        if (profileDTO.getState() != null) user.setState(profileDTO.getState());
        if (profileDTO.getCountry() != null) user.setCountry(profileDTO.getCountry());
        if (profileDTO.getZipCode() != null) user.setZipCode(profileDTO.getZipCode());
        if (profileDTO.getCurrentJobTitle() != null) user.setCurrentJobTitle(profileDTO.getCurrentJobTitle());
        if (profileDTO.getCurrentCompany() != null) user.setCurrentCompany(profileDTO.getCurrentCompany());
        if (profileDTO.getExperience() != null) user.setExperience(profileDTO.getExperience());
        if (profileDTO.getEducation() != null) user.setEducation(profileDTO.getEducation());
        if (profileDTO.getLinkedinUrl() != null) user.setLinkedinUrl(profileDTO.getLinkedinUrl());
        if (profileDTO.getGithubUrl() != null) user.setGithubUrl(profileDTO.getGithubUrl());
        if (profileDTO.getPortfolioUrl() != null) user.setPortfolioUrl(profileDTO.getPortfolioUrl());

        user.setUpdatedAt(LocalDateTime.now());

        return Optional.of(userRepository.save(user));
    }

    // Company Profile Operations
    public Optional<Company> getCompanyProfile(String companyEmail) {
        return companyRepository.findByCompanyEmail(companyEmail);
    }

    public Optional<Company> updateCompanyProfile(String companyEmail, CompanyProfileDTO profileDTO) {
        Optional<Company> companyOpt = companyRepository.findByCompanyEmail(companyEmail);
        if (companyOpt.isEmpty()) {
            return Optional.empty();
        }

        Company company = companyOpt.get();

        // Update allowed fields
        if (profileDTO.getName() != null) company.setName(profileDTO.getName());
        if (profileDTO.getEmail() != null) company.setEmail(profileDTO.getEmail());
        if (profileDTO.getAddress() != null) company.setAddress(profileDTO.getAddress());
        if (profileDTO.getCity() != null) company.setCity(profileDTO.getCity());
        if (profileDTO.getState() != null) company.setState(profileDTO.getState());
        if (profileDTO.getCountry() != null) company.setCountry(profileDTO.getCountry());
        if (profileDTO.getZipCode() != null) company.setZipCode(profileDTO.getZipCode());
        if (profileDTO.getPhone() != null) company.setPhone(profileDTO.getPhone());
        if (profileDTO.getWebsite() != null) company.setWebsite(profileDTO.getWebsite());
        if (profileDTO.getIndustry() != null) company.setIndustry(profileDTO.getIndustry());
        if (profileDTO.getCompanySize() != null) company.setCompanySize(profileDTO.getCompanySize());
        if (profileDTO.getDescription() != null) company.setDescription(profileDTO.getDescription());
        if (profileDTO.getMission() != null) company.setMission(profileDTO.getMission());
        if (profileDTO.getVision() != null) company.setVision(profileDTO.getVision());

        company.setUpdatedAt(LocalDateTime.now());

        return Optional.of(companyRepository.save(company));
    }
}
