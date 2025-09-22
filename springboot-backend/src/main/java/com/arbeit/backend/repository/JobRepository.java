package com.arbeit.backend.repository;

import com.arbeit.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    Optional<Job> findByJobId(String jobId);

    List<Job> findByCompanyEmail(String companyEmail);

    List<Job> findByStatus(String status);

    List<Job> findByCompanyEmailAndStatus(String companyEmail, String status);

    List<Job> findByStatusOrderByPostedDateDesc(String status);

    default List<Job> findActiveJobs() {
        return findByStatus("Active");
    }

    default Optional<Job> findActiveJobByJobId(String jobId) {
        return findByJobId(jobId).filter(job -> "Active".equals(job.getStatus()));
    }

    boolean existsByJobId(String jobId);

    default List<Job> findActiveJobsSortedByPostedDate() {
        return findByStatusOrderByPostedDateDesc("Active");
    }

    long countByCompanyEmail(String companyEmail);

    long countByStatus(String status);
}
