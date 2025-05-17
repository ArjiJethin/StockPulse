package dev.jumpers.StockPulse.service;

import dev.jumpers.StockPulse.model.User;
import dev.jumpers.StockPulse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public boolean authenticate(String username, String rawPassword) {
        User user = userRepository.findByUsername(username);
        return user != null && passwordEncoder.matches(rawPassword, user.getPassword());
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username) != null;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

}
