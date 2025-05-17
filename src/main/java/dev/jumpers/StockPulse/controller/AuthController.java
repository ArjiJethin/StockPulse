package dev.jumpers.StockPulse.controller;

import dev.jumpers.StockPulse.model.User;
import dev.jumpers.StockPulse.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        userService.registerUser(user);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (userService.authenticate(username, password)) {
            User user = userService.findByUsername(username);
            Map<String, Object> body = Map.of(
                    "id", user.getId(),
                    "username", user.getUsername());
            return ResponseEntity.ok(body); // ✅ return actual JSON
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

}
