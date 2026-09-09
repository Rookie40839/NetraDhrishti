package com.netradhrishti.api.repositories;

import com.netradhrishti.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndActiveTrue(String email);
    boolean existsByEmail(String email);
}
