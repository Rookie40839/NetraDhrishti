package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.User;
import com.netradhrishti.api.repositories.UserRepository;
import com.netradhrishti.api.security.JwtUtil;
import com.netradhrishti.api.services.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    public record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest servletRequest) {
        if (req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        var userOpt = userRepository.findByEmailAndActiveTrue(req.email().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user);

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getUserId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("constituencyId", user.getConstituencyId());
        userData.put("districtId", user.getDistrictId());
        userData.put("stateId", user.getStateId());

        auditLogService.logAction(
                user.getUserId(),
                "LOGIN",
                "USER",
                user.getUserId().toString(),
                "{\"status\":\"SUCCESS\"}",
                servletRequest.getRemoteAddr()
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", userData
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }

        String email = auth.getName();
        var userOpt = userRepository.findByEmailAndActiveTrue(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getUserId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("constituencyId", user.getConstituencyId());
        userData.put("districtId", user.getDistrictId());
        userData.put("stateId", user.getStateId());

        return ResponseEntity.ok(userData);
    }
}
