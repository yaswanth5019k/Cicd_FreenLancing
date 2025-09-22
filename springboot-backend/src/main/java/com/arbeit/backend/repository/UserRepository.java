package com.arbeit.backend.repository;

import com.arbeit.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId);

    boolean existsByEmail(String email);

    boolean existsByUserId(String userId);
}
