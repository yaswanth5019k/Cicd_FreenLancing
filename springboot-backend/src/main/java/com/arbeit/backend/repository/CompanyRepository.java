package com.arbeit.backend.repository;

import com.arbeit.backend.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByCompanyEmail(String companyEmail);

    Optional<Company> findByBid(String bid);

    boolean existsByCompanyEmail(String companyEmail);

    boolean existsByBid(String bid);
}
