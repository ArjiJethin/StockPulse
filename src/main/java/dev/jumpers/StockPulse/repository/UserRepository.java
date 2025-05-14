package dev.jumpers.StockPulse.repository;

import dev.jumpers.StockPulse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
