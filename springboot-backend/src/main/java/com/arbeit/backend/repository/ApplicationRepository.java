package com.arbeit.backend.repository;

import com.arbeit.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByUserIdAndJobId(String userId, String jobId);

    List<Application> findByJobId(String jobId);

    List<Application> findByUserId(String userId);

    List<Application> findByStatus(String status);

    List<Application> findAllByOrderByAppliedDateDesc();

    boolean existsByUserIdAndJobId(String userId, String jobId);

    long countByJobId(String jobId);

    long countByStatus(String status);
}
